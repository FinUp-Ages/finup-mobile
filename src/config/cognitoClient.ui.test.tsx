/// <reference types="jest" />

const originalFetch = globalThis.fetch;
const originalRegion = process.env.EXPO_PUBLIC_COGNITO_REGION;
const originalClientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID;
const mockFetch = jest.fn();

function client(region: string, clientId: string): typeof import('./cognitoClient') {
  process.env.EXPO_PUBLIC_COGNITO_REGION = region;
  process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID = clientId;
  let module: typeof import('./cognitoClient');
  jest.isolateModules(() => { module = require('./cognitoClient'); });
  return module!;
}

function response(status: number, body: string, errorHeader: string | null = null) {
  return { status, ok: status >= 200 && status < 300, text: jest.fn().mockResolvedValue(body), headers: { get: jest.fn().mockReturnValue(errorHeader) } } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalRegion === undefined) delete process.env.EXPO_PUBLIC_COGNITO_REGION;
  else process.env.EXPO_PUBLIC_COGNITO_REGION = originalRegion;
  if (originalClientId === undefined) delete process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID;
  else process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID = originalClientId;
});

test('recusa configuração ausente sem enviar requisição', async () => {
  const { cognitoRequest } = client('', '');
  await expect(cognitoRequest('SignUp', {})).rejects.toMatchObject({ name: 'CognitoError', code: 'MissingConfiguration' });
  expect(mockFetch).not.toHaveBeenCalled();
});

test('envia operação e dados ao endpoint configurado e devolve JSON', async () => {
  const { cognitoRequest } = client('test-region-1', 'client-ficticio');
  mockFetch.mockResolvedValueOnce(response(200, '{"UserConfirmed":false}'));
  await expect(cognitoRequest('SignUp', { Username: 'ana' })).resolves.toEqual({ UserConfirmed: false });
  expect(mockFetch).toHaveBeenCalledWith('https://cognito-idp.test-region-1.amazonaws.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-amz-json-1.1', 'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp' },
    body: JSON.stringify({ ClientId: 'client-ficticio', Username: 'ana' }),
  });
});

test('interpreta código do corpo, removendo namespace', async () => {
  const { cognitoRequest } = client('test-region-1', 'client-ficticio');
  mockFetch.mockResolvedValueOnce(response(400, JSON.stringify({ __type: 'com.amazon#CodeMismatchException', message: 'Código incorreto' })));
  await expect(cognitoRequest('ConfirmSignUp', {})).rejects.toMatchObject({ name: 'CognitoError', code: 'CodeMismatchException', message: 'Código incorreto' });
});

test('usa header de erro quando corpo inválido e recorre ao status sem header', async () => {
  const { cognitoRequest } = client('test-region-1', 'client-ficticio');
  mockFetch.mockResolvedValueOnce(response(400, 'não é JSON', 'NotAuthorizedException:http://exemplo'))
    .mockResolvedValueOnce(response(503, ''));
  await expect(cognitoRequest('InitiateAuth', {})).rejects.toMatchObject({ code: 'NotAuthorizedException' });
  await expect(cognitoRequest('InitiateAuth', {})).rejects.toMatchObject({ code: 'HttpError503', message: 'HttpError503' });
});

test('resposta bem-sucedida sem corpo resulta em objeto vazio', async () => {
  const { cognitoRequest } = client('test-region-1', 'client-ficticio');
  mockFetch.mockResolvedValueOnce(response(200, ''));
  await expect(cognitoRequest('ResendConfirmationCode', {})).resolves.toEqual({});
});
