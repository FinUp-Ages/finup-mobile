import { httpClient, HttpError } from '@/config/httpClient';
import type { TransactionPeriod, TransactionsResponse } from '@/types/transaction';

export const transactionModel = {
  // A identidade vem do access token que o httpClient injeta, nunca de userId.
  list: ({ from, to }: TransactionPeriod, signal?: AbortSignal) =>
    httpClient.get<TransactionsResponse>(
      `/api/v1/transactions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { signal },
    ),
};

export function transactionErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    switch (error.status) {
      case 400:
        return 'O período informado é inválido. Tente atualizar a tela.';
      case 401:
        return 'Sua sessão expirou. Entre novamente para consultar as transações.';
      case 404:
        return 'Conclua seu cadastro para consultar as transações.';
    }
  }
  return error instanceof TypeError
    ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
    : 'Não foi possível carregar as transações. Tente novamente.';
}
