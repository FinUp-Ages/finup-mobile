export type TransactionType = 'INCOME' | 'EXPENSE';

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
};

/**
 * Espelha CreateTransactionRequest.java. Sem userId: o back tira o usuario do
 * access token que o httpClient injeta.
 */
export type CreateTransactionPayload = {
  categoryId: string;
  paymentMethodId: string | null;
  type: TransactionType;
  description?: string;
  amount: number;
  transactionDate: string;
  isRecurring: boolean;
};

export type TransactionResponse = {
  id: string;
  userId: string;
  categoryId: string;
  paymentMethodId: string | null;
  type: TransactionType;
  description: string | null;
  amount: number;
  transactionDate: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Espelha TransactionListResponse.java (GET /api/v1/transactions?from&to). */
export type TransactionListResponse = {
  balance: number;
  transactions: {
    id: string;
    categoryId: string;
    paymentMethodId: string | null;
    type: TransactionType;
    description: string | null;
    amount: number;
    transactionDate: string;
    isRecurring: boolean;
    createdAt: string;
  }[];
};
