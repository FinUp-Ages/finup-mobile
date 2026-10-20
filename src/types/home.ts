import type { TransactionType } from '@/types/transaction';

/** Estado de carga dos dados da Home (nome, saldo e gastos). */
export type HomeStatus = 'loading' | 'error' | 'success';

/** Opcoes de filtro por tipo de movimentacao na Home. */
export type TransactionTypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

/** Movimentacao/Gasto pronto para exibir: textos e valor ja formatados. */
export type HomeExpense = {
  id: string;
  title: string;
  categoryName: string | null;
  date: string;
  amount: string;
  type?: TransactionType;
};