import { httpClient } from '@/config/httpClient';
import type { TransactionListResponse } from '@/types/transaction';

/**
 * MODEL - transacoes financeiras do usuario autenticado.
 *
 * Nenhuma chamada recebe userId: o dono vem do access token que o httpClient
 * injeta (contrato da fix/get-transactions-sem-userid do finup-backend).
 */
export const transactionModel = {
  /** Transacoes e saldo do periodo, com `from` e `to` inclusivos (yyyy-MM-dd). */
  list: (from: string, to: string) =>
    httpClient.get<TransactionListResponse>(
      `/api/v1/transactions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),
};
