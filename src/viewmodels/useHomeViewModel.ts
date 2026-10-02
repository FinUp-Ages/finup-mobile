import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionModel } from '@/models/transactionModel';
import { userModel } from '@/models/userModel';
import type { HomeExpense, HomeStatus } from '@/types/home';
import type { Category, TransactionListResponse } from '@/types/transaction';
import { firstName, formatBRL, formatShortDate } from '@/utils/format';
import { DEFAULT_HOME_PERIOD, homePeriodRange, type HomePeriodKey } from '@/utils/homePeriods';

type TransactionListItem = TransactionListResponse['transactions'][number];

/**
 * VIEWMODEL - dados da Home.
 *
 *   GET /api/v1/users/me              -> nome da saudacao
 *   GET /api/v1/transactions?from&to  -> saldo, entradas, saidas e gastos de todo o
 *                                        historico ate hoje (mesmo saldo da Analise)
 *   GET /api/v1/categories            -> nome da categoria de cada gasto
 *
 * O periodo (7/15/30 dias, 3/6/12 meses) e escolhido no card; trocar de periodo
 * volta ao loading do card e busca de novo.
 *
 * Tudo vem do usuario do access token (o httpClient injeta); nenhum id e
 * enviado. Sessao expirada (401) ja e tratada no httpClient, que volta ao
 * login. Falha so nas categorias nao derruba a tela: os gastos aparecem sem o
 * nome da categoria.
 *
 * Recarrega sempre que a Home ganha foco, para gastos cadastrados em outra
 * tela aparecerem; se ja ha dados do mesmo periodo, recarrega sem loading.
 */

const MAX_EXPENSES = 10;

type HomeData = {
  userName: string;
  balance: string;
  income: string;
  expense: string;
  hasTransactions: boolean;
  expenses: HomeExpense[];
};

function toExpenses(transactions: TransactionListItem[], categories: Category[]): HomeExpense[] {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return [...transactions]
    .filter((transaction) => transaction.type === 'EXPENSE')
    .sort(
      (a, b) =>
        b.transactionDate.localeCompare(a.transactionDate) ||
        b.createdAt.localeCompare(a.createdAt),
    )
    .slice(0, MAX_EXPENSES)
    .map((transaction) => {
      const categoryName = categoryNames.get(transaction.categoryId) ?? null;
      return {
        id: transaction.id,
        title: transaction.description?.trim() || categoryName || 'Gasto',
        categoryName,
        date: formatShortDate(transaction.transactionDate),
        amount: formatBRL(-transaction.amount),
      };
    });
}

async function fetchHomeData(periodKey: HomePeriodKey): Promise<HomeData> {
  const period = homePeriodRange(periodKey);

  const [user, list, categories] = await Promise.all([
    userModel.getMe(),
    transactionModel.list(period.from, period.to),
    categoriesModel.listAvailable().catch((): Category[] => []),
  ]);

  const sum = (type: TransactionListItem['type']) =>
    list.transactions
      .filter((transaction) => transaction.type === type)
      .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    userName: firstName(user.name),
    balance: formatBRL(list.balance),
    income: `+ ${formatBRL(sum('INCOME'))}`,
    expense: `- ${formatBRL(sum('EXPENSE'))}`,
    hasTransactions: list.transactions.length > 0,
    expenses: toExpenses(list.transactions, categories),
  };
}

export function useHomeViewModel() {
  const [status, setStatus] = useState<HomeStatus>('loading');
  const [data, setData] = useState<HomeData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [periodKey, setPeriodKey] = useState<HomePeriodKey>(DEFAULT_HOME_PERIOD);

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

  const retry = useCallback(() => load('initial', periodKey), [load, periodKey]);
  const refresh = useCallback(() => load('pull', periodKey), [load, periodKey]);

  return {
    status,
    userName: data?.userName ?? null,
    balance: data?.balance ?? null,
    income: data?.income ?? null,
    expense: data?.expense ?? null,
    hasTransactions: data?.hasTransactions ?? false,
    expenses: data?.expenses ?? [],
    periodKey,
    periodLabel: homePeriodRange(periodKey).label,
    setPeriodKey,
    refreshing,
    retry,
    refresh,
  };
}
