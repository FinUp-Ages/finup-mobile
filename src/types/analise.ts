import type { TransactionType } from '@/types/transaction';

export type AnaliseStatus = 'loading' | 'error' | 'sessionExpired' | 'success';
export type AnalisePeriodKey = '7d' | '10d' | '20d';
export type AnaliseTypeFilter = 'ALL' | TransactionType;
export type AnaliseSortOrder = 'NEWEST' | 'HIGHEST_AMOUNT' | 'LOWEST_AMOUNT';

export type AnaliseMovement = {
  id: string;
  type: TransactionType;
  amountValue: number;
  categoryName: string;
  createdAt: string;
  title: string;
  transactionDate: string;
  date: string;
  amount: string;
};

export type AnaliseCategoryExpense = {
  id: string;
  name: string;
  amount: string;
  percentage: number;
};
