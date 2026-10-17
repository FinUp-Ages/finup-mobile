import type { AnaliseMovement } from '@/types/analise';
import type { Category, TransactionListResponse } from '@/types/transaction';
import { formatShortDate } from '@/utils/format';
import { formatAmount } from '@/utils/masks';

export type TransacaoAnalise = TransactionListResponse['transactions'][number];

export function nomeCategoria(categoryId: string, categories: Category[]) {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Outros';
}

/** Ordena por data da transação e, em caso de empate, pela data de criação. */
export function ordenarTransacoesRecentes(transactions: TransacaoAnalise[]) {
  return [...transactions].sort(
    (left, right) =>
      right.transactionDate.localeCompare(left.transactionDate) ||
      right.createdAt.localeCompare(left.createdAt),
  );
}

/** Associa categoria e prepara a movimentação para consumo da View. */
export function mapearMovimentacoes(
  transactions: TransacaoAnalise[],
  categories: Category[],
): AnaliseMovement[] {
  return ordenarTransacoesRecentes(transactions).map((transaction) => {
    const categoryName = nomeCategoria(transaction.categoryId, categories);
    return {
      amount:
        transaction.type === 'EXPENSE'
          ? `- ${formatAmount(transaction.amount)}`
          : `+ ${formatAmount(transaction.amount)}`,
      amountValue: transaction.amount,
      categoryName,
      createdAt: transaction.createdAt,
      date: formatShortDate(transaction.transactionDate),
      id: transaction.id,
      title: transaction.description?.trim() || categoryName,
      transactionDate: transaction.transactionDate,
      type: transaction.type,
    };
  });
}
