/// <reference types="jest" />
import { httpClient } from '@/config/httpClient';
import { paymentMethodsModel } from './paymentMethodsModel';
jest.mock('@/config/httpClient', () => ({ httpClient: { get: jest.fn() } }));
test('solicita meios de pagamento e propaga resultado ou falha', async () => {
  jest.mocked(httpClient.get).mockResolvedValueOnce([{ id: 'p' }]).mockRejectedValueOnce(new Error('offline'));
  await expect(paymentMethodsModel.listAvailable()).resolves.toEqual([{ id: 'p' }]);
  expect(httpClient.get).toHaveBeenCalledWith('/api/v1/payment-methods');
  await expect(paymentMethodsModel.listAvailable()).rejects.toThrow('offline');
});
