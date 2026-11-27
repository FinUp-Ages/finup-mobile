/// <reference types="jest" />
import { CognitoError } from '@/config/cognitoClient';
import { authModel } from '@/models/authModel';
import { HttpError, httpClient, setSessionExpiredHandler } from './httpClient';

jest.mock('@/models/authModel', () => ({ authModel: { getValidAccessToken: jest.fn(), hasSession: jest.fn(), clearSession: jest.fn() } }));

const originalFetch = globalThis.fetch;
const mockFetch = jest.fn();

function response(status: number, body: unknown) {
  return { status, ok: status >= 200 && status < 300, json: jest.fn().mockResolvedValue(body) } as unknown as Response;
}

beforeEach(() => {
  jest.resetAllMocks();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  jest.mocked(authModel.getValidAccessToken).mockResolvedValue('token-ficticio');
  jest.mocked(authModel.hasSession).mockResolvedValue(true);
  jest.mocked(authModel.clearSession).mockResolvedValue(undefined);
  setSessionExpiredHandler(null);
});

afterEach(() => {
  setSessionExpiredHandler(null);
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});

test('GET autenticado envia access token e devolve JSON', async () => {
  mockFetch.mockResolvedValueOnce(response(200, { id: 1 }));
  await expect(httpClient.get('/exemplo')).resolves.toEqual({ id: 1 });
  expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/exemplo$/), expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-ficticio' }, signal: expect.anything() }));
});

test('requisição pública não consulta token nem expira sessão em 401', async () => {
  mockFetch.mockResolvedValueOnce(response(401, { detail: 'Negado' }));
  await expect(httpClient.post('/publico', { email: 'a@b.com' }, { auth: false })).rejects.toMatchObject({ status: 401, detail: 'Negado' });
  expect(authModel.getValidAccessToken).not.toHaveBeenCalled();
  expect(authModel.clearSession).not.toHaveBeenCalled();
  expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/publico$/), expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'a@b.com' }), headers: { 'Content-Type': 'application/json' } }));
});

test('suporta métodos de escrita e resposta sem conteúdo', async () => {
  mockFetch.mockResolvedValue(response(204, null));
  await expect(httpClient.put('/item', { value: 1 })).resolves.toBeUndefined();
  await expect(httpClient.patch('/item', { value: 2 })).resolves.toBeUndefined();
  await expect(httpClient.delete('/item')).resolves.toBeUndefined();
  expect(mockFetch.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'PUT', body: '{"value":1}' }));
  expect(mockFetch.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'PATCH', body: '{"value":2}' }));
  expect(mockFetch.mock.calls[2][1]).toEqual(expect.objectContaining({ method: 'DELETE' }));
});

test('preserva detalhes válidos e descarta campos inválidos no erro', async () => {
  mockFetch.mockResolvedValueOnce(response(422, { detail: '  Corrija os dados  ', fields: [{ field: 'amount', message: 'Inválido' }, { field: 4 }, null] }));
  await expect(httpClient.get('/item')).rejects.toMatchObject({ name: 'HttpError', status: 422, detail: 'Corrija os dados', fields: [{ field: 'amount', message: 'Inválido' }] });
});

test('corpo de erro inválido gera HttpError sem detalhes', async () => {
  mockFetch.mockResolvedValueOnce({ status: 500, ok: false, json: jest.fn().mockRejectedValue(new Error('JSON')) });
  await expect(httpClient.get('/item')).rejects.toMatchObject({ status: 500, detail: null, fields: [] });
});

test('401 com sessão limpa credenciais e avisa handler', async () => {
  const handler = jest.fn();
  setSessionExpiredHandler(handler);
  mockFetch.mockResolvedValueOnce(response(401, {}));
  await expect(httpClient.get('/privado')).rejects.toMatchObject({ status: 401, message: 'Sessao expirada.' });
  expect(authModel.clearSession).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledTimes(1);
});

test('refresh recusado encerra sessão sem chamar rede; erro de conexão é propagado', async () => {
  const handler = jest.fn();
  setSessionExpiredHandler(handler);
  jest.mocked(authModel.getValidAccessToken).mockRejectedValueOnce(new CognitoError('NotAuthorizedException', 'revogado')).mockRejectedValueOnce(new TypeError('offline'));
  await expect(httpClient.get('/privado')).rejects.toBeInstanceOf(HttpError);
  expect(authModel.clearSession).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledTimes(1);
  await expect(httpClient.get('/privado')).rejects.toThrow('offline');
  expect(mockFetch).not.toHaveBeenCalled();
});

test('timeout cancela fetch e encerra o temporizador', async () => {
  jest.useFakeTimers();
  mockFetch.mockImplementationOnce((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new Error('abortado')));
  }));
  const request = httpClient.get('/lento', { timeoutMs: 100 });
  const rejected = expect(request).rejects.toThrow('abortado');
  await jest.advanceTimersByTimeAsync(100);
  await rejected;
  expect(jest.getTimerCount()).toBe(0);
});
