import { httpClient } from '@/config/httpClient';
import type { CreateTransactionPayload, TransactionResponse } from '@/types/transaction';

/** MODEL - cadastro de transacoes financeiras. Payload identico ao contrato do backend. */
export const transactionModel = {
  create: (payload: CreateTransactionPayload) =>
    httpClient.post<TransactionResponse>('/api/v1/transactions', payload),
};
