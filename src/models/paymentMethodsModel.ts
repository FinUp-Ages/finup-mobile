import { httpClient } from '@/config/httpClient';
import type { PaymentMethod } from '@/types/transaction';

/** MODEL - meios de pagamento ativos do usuario autenticado. */
export const paymentMethodsModel = {
  listAvailable: () => httpClient.get<PaymentMethod[]>('/api/v1/payment-methods'),
};
