import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionEvents } from '@/models/transactionEvents';
import { BALANCE_FROM, transactionModel } from '@/models/transactionModel';
import { userModel } from '@/models/userModel';
import type { HomeStatus, TransactionTypeFilter } from '@/types/home';
import type { Category, TransactionListResponse } from '@/types/transaction';
import { firstName } from '@/utils/format';
import { DEFAULT_HOME_PERIOD, homePeriodRange, type HomePeriodKey } from '@/utils/homePeriods';
import { formatAmount } from '@/utils/masks';
import {
  DEFAULT_TYPE_FILTER,
  processHomeTransactions,
} from '@/utils/transactionFilters';

type TransactionListItem = TransactionListResponse['transactions'][number];

/**
 * VIEWMODEL - dados da Home.
 *
 *   GET /api/v1/users/me              -> nome da saudacao
 *   GET /api/v1/transactions?from&to  -> entradas, saidas e movimentacoes do periodo; e
 *                                        de novo desde BALANCE_FROM para o saldo total
 *   GET /api/v1/categories            -> nome da categoria de cada transacao
 *
 * O periodo (7/15/30 dias, 3/6/12 meses) e escolhido no card e vale para entradas,
 * saidas e gastos; o saldo total e sempre o acumulado ate hoje.
 *
 * O filtro por tipo ('ALL' | 'INCOME' | 'EXPENSE') filtra os itens exibidos na
 * listagem/carrossel da Home sem afetar os totais de saldo, entrada e saida.
 */

const MAX_EXPENSES = 10;

type HomeData = {
  userName: string;
  balance: string;
  income: string;
  expense: string;
  rawTransactions: TransactionListItem[];
  categories: Category[];
};

async function fetchHomeData(periodKey: HomePeriodKey): Promise<HomeData> {
  const period = homePeriodRange(periodKey);

  const [user, list, total, categories] = await Promise.all([
    userModel.getMe(),
    transactionModel.list(period.from, period.to),
    transactionModel.list(BALANCE_FROM, period.to),
    categoriesModel.listAvailable().catch((): Category[] => []),
  ]);

  const sum = (type: TransactionListItem['type']) =>
    list.transactions
      .filter((transaction) => transaction.type === type)
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

  return {
    userName: firstName(user.name),
    balance: formatAmount(total.balance),
    income: `+ ${formatAmount(sum('INCOME'))}`,
    expense: `- ${formatAmount(sum('EXPENSE'))}`,
    rawTransactions: list.transactions,
    categories,
  };
}

export function useHomeViewModel() {
  const [status, setStatus] = useState<HomeStatus>('loading');
  const [data, setData] = useState<HomeData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [periodKey, setPeriodKey] = useState<HomePeriodKey>(DEFAULT_HOME_PERIOD);
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>(DEFAULT_TYPE_FILTER);

  // Descarta resposta de uma carga anterior que termine depois da mais nova.
  const requestIdRef = useRef(0);
  const loadedPeriodRef = useRef<HomePeriodKey | null>(null);

  const load = useCallback(async (mode: 'initial' | 'silent' | 'pull', key: HomePeriodKey) => {
    const requestId = ++requestIdRef.current;
    if (mode === 'initial') setStatus('loading');
    if (mode === 'pull') setRefreshing(true);

    try {
      const next = await fetchHomeData(key);
      if (requestId !== requestIdRef.current) return;
      loadedPeriodRef.current = key;
      setData(next);
      setStatus('success');
    } catch {
      if (requestId !== requestIdRef.current) return;
      // Recarga (foco ou pull) que falha mantem o que ja esta na tela.
      if (mode === 'initial' || loadedPeriodRef.current !== key) setStatus('error');
    } finally {
      if (requestId === requestIdRef.current) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(loadedPeriodRef.current === periodKey ? 'silent' : 'initial', periodKey);
    }, [load, periodKey]),
  );

  // O chatbot (outra aba, ja montada) pode registrar transacoes: recarrega o saldo.
  useEffect(() => transactionEvents.subscribe(() => load('silent', periodKey)), [load, periodKey]);

  const retry = useCallback(() => load('initial', periodKey), [load, periodKey]);
  const refresh = useCallback(() => load('pull', periodKey), [load, periodKey]);

  const expenses = useMemo(() => {
    if (!data) return [];
    return processHomeTransactions(
      data.rawTransactions,
      data.categories,
      typeFilter,
      MAX_EXPENSES,
    );
  }, [data, typeFilter]);

  return {
    status,
    userName: data?.userName ?? null,
    balance: data?.balance ?? null,
    income: data?.income ?? null,
    expense: data?.expense ?? null,
    expenses,
    periodKey,
    periodLabel: homePeriodRange(periodKey).label,
    setPeriodKey,
    typeFilter,
    setTypeFilter,
    refreshing,
    retry,
    refresh,
  };
}