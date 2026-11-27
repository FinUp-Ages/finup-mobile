/// <reference types="jest" />
import { httpClient } from '@/config/httpClient';
import { exampleModel } from './exampleModel';
jest.mock('@/config/httpClient', () => ({ httpClient: { get: jest.fn(), post: jest.fn() } }));
test('consulta lista e detalhe sem chamar rede', async () => {
  await exampleModel.listAll();
  await exampleModel.findById('123');
  expect(httpClient.get).toHaveBeenNthCalledWith(1, '/api/examples');
  expect(httpClient.get).toHaveBeenNthCalledWith(2, '/api/examples/123');
});
