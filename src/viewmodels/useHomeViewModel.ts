import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionModel } from '@/models/transactionModel';
import { userModel } from '@/models/userModel';
import type { HomeExpense, HomeStatus } from '@/types/home';
import type { Category, TransactionListItem } from '@/types/transaction';
import { currentMonthPeriod } from '@/utils/dates';
import { firstName, formatBRL, formatShortDate } from '@/utils/format';

/**
 * VIEWMODEL - dados da Home.
 *
 *   GET /api/v1/users/me              -> nome da saudacao
 *   GET /api/v1/transactions?from&to  -> saldo e gastos do mes corrente
 *   GET /api/v1/categories            -> nome da categoria de cada gasto
 *
 * Tudo vem do usuario do access token (o httpClient injeta); nenhum id e
 * enviado. Sessao expirada (401) ja e tratada no httpClient, que volta ao
 * login. Falha so nas categorias nao derruba a tela: os gastos aparecem sem o
 * nome da categoria.
 *
 * Recarrega sempre que a Home ganha foco, para gastos cadastrados em outra
 * tela aparecerem; se ja ha dados, recarrega sem voltar ao estado de loading.
 */

type HomeData = {
  userName: string;
  balance: string;
  hasTransactions: boolean;
  expenses: HomeExpense[];
  periodLabel: string;
};

function toExpenses(transactions: TransactionListItem[], categories: Category[]): HomeExpense[] {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
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

async function fetchHomeData(): Promise<HomeData> {
  const period = currentMonthPeriod();

  const [user, list, categories] = await Promise.all([
    userModel.getMe(),
    transactionModel.list(period.from, period.to),
    categoriesModel.listAvailable().catch((): Category[] => []),
  ]);

  return {
    userName: firstName(user.name),
    balance: formatBRL(list.balance),
    hasTransactions: list.transactions.length > 0,
    expenses: toExpenses(list.transactions, categories),
    periodLabel: period.label,
  };
}

export function useHomeViewModel() {
  const [status, setStatus] = useState<HomeStatus>('loading');
  const [data, setData] = useState<HomeData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Descarta resposta de uma carga anterior que termine depois da mais nova.
  const requestIdRef = useRef(0);
  const hasDataRef = useRef(false);

  const load = useCallback(async (mode: 'initial' | 'silent' | 'pull') => {
    const requestId = ++requestIdRef.current;
    if (mode === 'initial') setStatus('loading');
    if (mode === 'pull') setRefreshing(true);

    try {
      const next = await fetchHomeData();
      if (requestId !== requestIdRef.current) return;
      hasDataRef.current = true;
      setData(next);
      setStatus('success');
    } catch {
      if (requestId !== requestIdRef.current) return;
      // Recarga (foco ou pull) que falha mantem o que ja esta na tela.
      if (mode === 'initial' || !hasDataRef.current) setStatus('error');
    } finally {
      if (requestId === requestIdRef.current) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(hasDataRef.current ? 'silent' : 'initial');
    }, [load]),
  );

  const retry = useCallback(() => load('initial'), [load]);
  const refresh = useCallback(() => load('pull'), [load]);

  return {
    status,
    userName: data?.userName ?? null,
    balance: data?.balance ?? null,
    hasTransactions: data?.hasTransactions ?? false,
    expenses: data?.expenses ?? [],
    periodLabel: data?.periodLabel ?? currentMonthPeriod().label,
    refreshing,
    retry,
    refresh,
  };
}
