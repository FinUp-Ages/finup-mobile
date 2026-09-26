import type { PaymentMethod } from '@/types/transaction';

/**
 * MODEL - metodos de pagamento (MOCK).
 *
 * GET /api/v1/payment-methods ainda nao existe em nenhuma branch do backend -
 * bloqueia esta tarefa como dependencia em desenvolvimento. Lista estatica
 * isolada aqui pra trocar por uma chamada real
 * (httpClient.get<PaymentMethod[]>('/api/v1/payment-methods')) sem tocar no
 * ViewModel nem na View - a assinatura ja e Promise<PaymentMethod[]>.
 *
 * Os ids abaixo sao placeholders, nao UUIDs de linhas reais de
 * payment_methods no banco (essa tabela e por-usuario e os ids sao gerados
 * via gen_random_uuid() no seed - nao ha como ter um id estavel aqui ainda).
 * Selecionar um destes hoje e enviar no POST /api/v1/transactions resulta em
 * 404 ("meio de pagamento inexistente") do backend - esperado ate o endpoint
 * real existir.
 */
export function listPaymentMethodsMock(): Promise<PaymentMethod[]> {
  return Promise.resolve([
    { id: 'mock-pix', name: 'Pix' },
    { id: 'mock-credit-card', name: 'Cartão de crédito' },
    { id: 'mock-cash', name: 'Dinheiro' },
    { id: 'mock-apple-pay', name: 'Apple Pay' },
  ]);
}
