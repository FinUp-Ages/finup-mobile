export type TransactionType = 'INCOME' | 'EXPENSE';

/** Espelha CategoryListResponse.java (GET /api/v1/categories). */
export type Category = {
  id: string;
  name: string;
  type: TransactionType;
};

/**
 * Espelha TransactionListItemResponse.java. `amount` vem em reais, sempre
 * positivo (o sinal e dado pelo `type`); `transactionDate` em yyyy-MM-dd.
 */
export type TransactionListItem = {
  id: string;
  categoryId: string;
  paymentMethodId: string | null;
  type: TransactionType;
  description: string | null;
  amount: number;
  transactionDate: string;
  isRecurring: boolean;
  createdAt: string;
};

/**
 * Espelha TransactionListResponse.java. `balance` = entradas - saidas do
 * periodo consultado, em reais (pode ser negativo).
 */
export type TransactionListResponse = {
  balance: number;
  transactions: TransactionListItem[];
};
