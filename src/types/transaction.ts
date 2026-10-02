export type Transaction = {
  id: string;
  categoryId: string;
  paymentMethodId: string | null;
  type: 'INCOME' | 'EXPENSE';
  description: string | null;
  amount: number;
  transactionDate: string;
  isRecurring: boolean;
  createdAt: string;
};

export type TransactionsResponse = {
  balance: number;
  transactions: Transaction[];
};

// Datas de calendario (yyyy-MM-dd), com os dois limites inclusivos.
export type TransactionPeriod = {
  from: string;
  to: string;
};
