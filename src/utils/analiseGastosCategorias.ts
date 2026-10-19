import type { AnaliseCategoryExpense } from '@/types/analise';
import type { Category, TransactionListResponse } from '@/types/transaction';
import { formatAmount } from '@/utils/masks';

type Transacao = TransactionListResponse['transactions'][number];

export type GastosCategorias = {
  expenses: AnaliseCategoryExpense[];
  total: string;
};

function nomeCategoria(categoryId: string, categories: Category[]) {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Outros';
}

/**
 * Agrupa somente saídas por categoria e distribui os pontos percentuais
 * restantes pelos maiores restos, garantindo total de 100% após arredondar.
 */
export function calcularGastosCategorias(
  transactions: Transacao[],
  categories: Category[],
): GastosCategorias {
  const byCategory = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .forEach((transaction) => {
      const name = nomeCategoria(transaction.categoryId, categories);
      byCategory.set(name, (byCategory.get(name) ?? 0) + transaction.amount);
    });

  const total = [...byCategory.values()].reduce((sum, amount) => sum + amount, 0);
  if (total <= 0) return { expenses: [], total: formatAmount(0) };

  const rows = [...byCategory.entries()]
    .map(([name, amount]) => ({
      amount,
      name,
      exactPercentage: (amount / total) * 100,
    }))
    .sort(
      (left, right) => right.amount - left.amount || left.name.localeCompare(right.name, 'pt-BR'),
    );

  const rounded = rows.map((row) => ({ ...row, percentage: Math.floor(row.exactPercentage) }));
  let remainingPoints = 100 - rounded.reduce((sum, row) => sum + row.percentage, 0);

  [...rounded]
    .sort(
      (left, right) =>
        right.exactPercentage - right.percentage - (left.exactPercentage - left.percentage) ||
        right.amount - left.amount ||
        left.name.localeCompare(right.name, 'pt-BR'),
    )
    .forEach((row) => {
      if (remainingPoints > 0) {
        row.percentage += 1;
        remainingPoints -= 1;
      }
    });

  return {
    expenses: rounded.map(({ name, amount, percentage }) => ({
      amount: formatAmount(amount),
      id: name,
      name,
      percentage,
    })),
    total: formatAmount(total),
  };
}
