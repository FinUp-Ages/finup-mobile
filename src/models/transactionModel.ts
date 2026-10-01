import { HttpError, httpClient } from '@/config/httpClient';
import type { CreateTransactionPayload, TransactionResponse } from '@/types/transaction';

const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

/**
 * Mensagem para a pessoa usuaria a partir de um erro ao salvar uma transacao
 * (TransactionService.requireAvailableReferences, finup-backend): 404 cobre
 * categoria ou meio de pagamento inexistente (ou de outro usuario), 422 cobre
 * categoria de um tipo incompativel com o tipo da transacao.
 */
export function transactionErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404) return 'Categoria ou meio de pagamento não encontrado.';
    if (error.status === 422)
      return 'Esta categoria não é compatível com o tipo de transação selecionado.';
    return GENERIC_MESSAGE;
  }
  // fetch() rejeita com TypeError quando nao ha rede.
  return error instanceof TypeError
    ? 'Sem conexão com a internet. Verifique e tente novamente.'
    : GENERIC_MESSAGE;
}

/** MODEL - cadastro de transacoes financeiras. Payload identico ao contrato do backend. */
export const transactionModel = {
  create: (payload: CreateTransactionPayload) =>
    httpClient.post<TransactionResponse>('/api/v1/transactions', payload),
};
