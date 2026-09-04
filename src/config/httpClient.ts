/**
 * CONFIG - cliente HTTP unico do app.
 *
 * Todo acesso a rede passa por aqui: baseURL, headers padrao, token de
 * autenticacao e tratamento de erro. Nenhuma outra camada chama fetch() direto.
 */
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      // TODO: implementar em tarefa futura - Authorization quando o login existir.
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, `Falha na requisicao: ${response.status}`);
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
