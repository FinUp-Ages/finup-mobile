/// <reference types="jest" />
import { HttpError, httpClient } from '@/config/httpClient';
import { userModel } from './userModel';
jest.mock('@/config/httpClient', () => ({
  HttpError: class extends Error { constructor(code: number, message: string) { super(message); Object.assign(this, { status: code }); } },
  httpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
beforeEach(() => jest.resetAllMocks());
test('consulta disponibilidade de email sem autenticação', async () => {
  jest.mocked(httpClient.post).mockResolvedValueOnce({ available: true });
  await expect(userModel.isEmailAvailable('a@b.com')).resolves.toBe(true);
  expect(httpClient.post).toHaveBeenCalledWith('/api/v1/users/email-availability', { email: 'a@b.com' }, { auth: false });
});
test('criação ignora conflito, mas propaga outras falhas', async () => {
  jest.mocked(httpClient.post).mockRejectedValueOnce(new HttpError(409, 'existe')).mockRejectedValueOnce(new HttpError(500, 'falhou'));
  await expect(userModel.ensureCreated()).resolves.toBeUndefined();
  await expect(userModel.ensureCreated()).rejects.toThrow('falhou');
});
