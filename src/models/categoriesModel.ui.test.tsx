/// <reference types="jest" />
import { httpClient } from '@/config/httpClient';
import { categoriesModel } from './categoriesModel';
jest.mock('@/config/httpClient', () => ({ httpClient: { get: jest.fn(), post: jest.fn() } }));
beforeEach(() => jest.resetAllMocks());
test('lista categorias e cria categoria com tipo', async () => {
  jest.mocked(httpClient.get).mockResolvedValueOnce([{ id: '1' }]);
  await expect(categoriesModel.listAvailable()).resolves.toEqual([{ id: '1' }]);
  expect(httpClient.get).toHaveBeenCalledWith('/api/v1/categories');
  await categoriesModel.create({ name: 'Lazer', type: 'EXPENSE' });
  expect(httpClient.post).toHaveBeenCalledWith('/api/v1/categories', { name: 'Lazer', type: 'EXPENSE' });
});
test('propaga falha de listagem', async () => {
  jest.mocked(httpClient.get).mockRejectedValueOnce(new Error('offline'));
  await expect(categoriesModel.listAvailable()).rejects.toThrow('offline');
});
