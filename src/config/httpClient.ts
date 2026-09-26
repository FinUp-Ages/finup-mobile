/**
 * CONFIG - cliente HTTP unico do app.
 *
 * Todo acesso a rede passa por aqui: baseURL, headers padrao, token de
 * autenticacao e tratamento de erro. Nenhuma outra camada chama fetch() direto.
 */
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * MOCK temporario de identidade autenticada, mesmo padrao do
 * MockAuthenticatedIdentityResolver do backend. Aponta pro usuario seed
 * "teste@finup.local" (finup-backend/database/init/03-test-data.sql) -
 * existe so pra desbloquear endpoints que ja exigem identidade (categories,
 * users/me) antes do login/Cognito real existir.
 *
 * Remover quando "[APP] Injetar Authorization no httpClient" implementar o
 * fluxo real: os headers X-Mock-Cognito-* saem, entra Authorization: Bearer
 * <token>. Nenhuma outra camada muda - todas chamam so httpClient.
 */
const MOCK_COGNITO_SUB = 'mock-sub-usuario-teste';
const MOCK_COGNITO_EMAIL = 'teste@finup.local';

export type ProblemDetail = {
  title?: string;
  detail?: string;
  status?: number;
  [key: string]: unknown;
};

export class HttpError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetail;

  constructor(status: number, message: string, problem?: ProblemDetail) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.problem = problem;
  }
}

async function parseProblem(response: Response): Promise<ProblemDetail | undefined> {
  try {
    return (await response.json()) as ProblemDetail;
  } catch {
    return undefined;
  }
}

/**
 * Mensagem amigavel a partir de um erro de rede - generica o bastante pra
 * qualquer status atual ou futuro (400 hoje, 422 amanha) sem mudar de codigo:
 * sempre le detail/title do ProblemDetail (RFC 7807, mesmo shape do
 * ApiExceptionHandler do backend), nunca decide por response.status.
 */
export function friendlyMessageFromError(
  error: unknown,
  fallback = 'Nao foi possivel concluir a operacao. Tente novamente.',
): string {
  if (error instanceof HttpError) {
    return error.problem?.detail ?? error.problem?.title ?? fallback;
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Mock-Cognito-Sub': MOCK_COGNITO_SUB,
      'X-Mock-Cognito-Email': MOCK_COGNITO_EMAIL,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = await parseProblem(response);
    const message = problem?.detail ?? problem?.title ?? `Falha na requisicao: ${response.status}`;
    throw new HttpError(response.status, message, problem);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const httpClient = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
};
