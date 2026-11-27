/// <reference types="jest" />
import { HttpError, httpClient } from '@/config/httpClient';
import { transactionErrorMessage, transactionModel } from './transactionModel';
jest.mock('@/config/httpClient', () => ({
  HttpError: class extends Error { constructor(code: number, message: string) { super(message); Object.assign(this, { status: code }); } },
  httpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
test('usa datas inclusivas e codifica id ao alterar categoria', async () => {
  await transactionModel.list('2026-01-01', '2026-01-31');
  await transactionModel.changeCategory('id /1', { categoryId: 'nova' });
  expect(httpClient.get).toHaveBeenCalledWith('/api/v1/transactions?from=2026-01-01&to=2026-01-31');
  expect(httpClient.patch).toHaveBeenCalledWith('/api/v1/transactions/id%20%2F1/category', { categoryId: 'nova' });
});
test('traduz falhas de referência, categoria e rede', () => {
  expect(transactionErrorMessage(new HttpError(404, 'x'))).toContain('não encontrado');
  expect(transactionErrorMessage(new HttpError(422, 'x'))).toContain('não é compatível');
  expect(transactionErrorMessage(new TypeError('offline'))).toContain('Sem conexão');
});
