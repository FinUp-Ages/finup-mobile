import type { Category, TransactionListResponse, TransactionType } from '../types/transaction';
import type { HomeExpense, TransactionTypeFilter } from '../types/home';
import { formatShortDate } from './format';
import { formatAmount } from './masks';

export type TransactionListItem = TransactionListResponse['transactions'][number];

export const DEFAULT_TYPE_FILTER: TransactionTypeFilter = 'ALL';

export const TYPE_FILTER_OPTIONS: { key: TransactionTypeFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'INCOME', label: 'Entrada' },
  { key: 'EXPENSE', label: 'Saída' },
];

/**
 * FUNCAO PURA - filtra transacoes pelo tipo ('ALL' | 'INCOME' | 'EXPENSE').
 * Nao muta o array original.
 */
export function filterTransactionsByType<T extends { type: TransactionType }>(
  transactions: readonly T[],
  filter: TransactionTypeFilter,
): T[] {
  if (filter === 'ALL') {
    return [...transactions];
  }
  return transactions.filter((transaction) => transaction.type === filter);
}

/**
 * FUNCAO PURA - ordena transacoes por data mais recente (transactionDate desc, createdAt desc).
 * Nao muta o array original.
 */
export function sortTransactionsByDateDesc<
  T extends { transactionDate: string; createdAt?: string },
>(transactions: readonly T[]): T[] {
  return [...transactions].sort(
    (a, b) =>
      b.transactionDate.localeCompare(a.transactionDate) ||
      (b.createdAt && a.createdAt ? b.createdAt.localeCompare(a.createdAt) : 0),
  );
}

/**
 * FUNCAO PURA - formata o valor de uma movimentacao de acordo com o tipo:
 * - INCOME:  + R$ 100,00
 * - EXPENSE: - R$ 100,00
 */
export function formatMovementAmount(amount: number, type: TransactionType): string {
  const formatted = formatAmount(Math.abs(amount));
  return type === 'INCOME' ? `+ ${formatted}` : `- ${formatted}`;
}

/**
 * FUNCAO PURA - aplica filtro por tipo, ordenacao e mapeia para itens de exibicao da Home.
 */
export function processHomeTransactions(
  transactions: readonly TransactionListItem[],
  categories: readonly Category[],
  typeFilter: TransactionTypeFilter,
  limit?: number,
): HomeExpense[] {
  const filtered = filterTransactionsByType(transactions, typeFilter);
  const sorted = sortTransactionsByDateDesc(filtered);
  const sliced = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return sliced.map((transaction) => {
    const categoryName = categoryNames.get(transaction.categoryId) ?? null;
    const defaultTitle = transaction.type === 'INCOME' ? 'Entrada' : 'Gasto';

    return {
      id: transaction.id,
      title: transaction.description?.trim() || categoryName || defaultTitle,
      categoryName,
      date: formatShortDate(transaction.transactionDate),
      amount: formatMovementAmount(transaction.amount, transaction.type),
      type: transaction.type,
    };
  });
}