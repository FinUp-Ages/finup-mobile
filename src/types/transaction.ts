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

/** Espelha CreateTransactionRequest.java - payload nao muda nesta tarefa. */
export type CreateTransactionPayload = {
  userId: string;
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
