/**
 * CONFIG - cliente HTTP unico do app.
 *
 * Todo acesso a rede passa por aqui: baseURL, headers padrao, token de
 * autenticacao e tratamento de erro. Nenhuma outra camada chama fetch() direto
 * (o cognitoClient e a excecao: fala com a AWS, nao com o back).
 *
 * Sessao: o Authorization vai sozinho em toda requisicao. 401 do back ou refresh
 * recusado limpam a sessao e chamam o handler de sessao expirada (volta ao login).
 */
import { CognitoError } from '@/config/cognitoClient';
import { authModel } from '@/models/authModel';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Padrao de cada requisicao; quem espera mais (ex.: o assistente de IA) passa
// `timeoutMs` nas opcoes.
const REQUEST_TIMEOUT_MS = 15000;

export class HttpError extends Error {
  readonly status: number;
  /** `detail` do problem+json do back, quando vier: texto ja escrito para o usuario. */
  readonly detail: string | null;

  constructor(status: number, message: string, detail: string | null = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.detail = detail;
  }
}

// O back responde erro em problem+json ({ title, status, detail }). Corpo vazio
// ou fora desse formato vira null: quem chama cai na propria mensagem.
async function readProblemDetail(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    return typeof body.detail === 'string' && body.detail.trim() ? body.detail.trim() : null;
  } catch {
    return null;
  }
}

// Quem sabe navegar (o RootLayout) registra aqui o que fazer quando a sessao cai:
// esta camada nao conhece rotas.
let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

async function expireSession(): Promise<never> {
  await authModel.clearSession();
  sessionExpiredHandler?.();
  throw new HttpError(401, 'Sessao expirada.');
}

// Access token valido para o Authorization (renova se o exp venceu). Refresh
// recusado derruba a sessao; falha de rede na renovacao segue como esta e mantem
// os tokens.
async function resolveAccessToken(): Promise<string | null> {
  try {
    return await authModel.getValidAccessToken();
  } catch (error) {
    if (error instanceof CognitoError && error.code === 'NotAuthorizedException') {
      return expireSession();
    }
    throw error;
  }
}

// `auth: false` para rota publica (ex.: consulta de e-mail no cadastro): nao manda
// Authorization nem derruba a sessao num 401. O back recusa com 401 ate a rota
// publica se vier um token invalido, entao quem nao precisa de token nao deve mandar.
type RequestOptions = RequestInit & { auth?: boolean; timeoutMs?: number };

async function request<T>(
  path: string,
  { auth = true, timeoutMs = REQUEST_TIMEOUT_MS, ...init }: RequestOptions = {},
): Promise<T> {
  const accessToken = auth ? await resolveAccessToken() : null;

  // Sem timeout, back fora do ar deixava a tela em "carregando" para sempre.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${baseURL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // Sempre o access token: o IdToken (token_use=id) o back recusa com 401.
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }

  if (auth && response.status === 401 && (await authModel.hasSession())) {
    return expireSession();
  }

  if (!response.ok) {
    throw new HttpError(response.status, `Falha na requisicao: ${response.status}`, await readProblemDetail(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const httpClient = {
  get: <T,>(path: string, init?: RequestOptions) => request<T>(path, init),
  post: <T,>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...init }),
  put: <T,>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...init }),
  patch: <T,>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...init }),
  delete: <T,>(path: string, init?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...init }),
};
