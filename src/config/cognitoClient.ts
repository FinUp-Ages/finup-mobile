/**
 * CONFIG - cliente da API publica do AWS Cognito (User Pool do FinUp).
 *
 * Mesmo papel do httpClient, mas para o Cognito: e o unico lugar que chama
 * fetch() para a AWS. As operacoes usadas (SignUp, ConfirmSignUp,
 * InitiateAuth...) nao exigem credencial da AWS nem SDK: todas sao um POST no
 * mesmo endpoint, mudando so o header X-Amz-Target.
 *
 * Regiao e client ID nao sao segredo (o app client "FinUp" nao tem secret).
 * Contrato: finup-backend/contracts/auth-mobile-cognito.md.
 */
const region = process.env.EXPO_PUBLIC_COGNITO_REGION ?? '';
const clientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID ?? '';

/**
 * Erro devolvido pelo Cognito. `code` e o nome da excecao (ex.:
 * "CodeMismatchException"): e por ele que o app decide a mensagem.
 */
export class CognitoError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message || code);
    this.name = 'CognitoError';
    this.code = code;
  }
}

type CognitoErrorBody = {
  __type?: string;
  message?: string;
  Message?: string;
};

// O nome da excecao pode vir como "NotAuthorizedException",
// "com.amazonaws...#NotAuthorizedException" (corpo) ou
// "NotAuthorizedException:http://..." (header x-amzn-ErrorType).
function parseErrorCode(raw: string): string {
  const withoutNamespace = raw.split('#').pop() ?? raw;
  return withoutNamespace.split(':')[0];
}

async function parseBody(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function cognitoRequest<T>(
  operation: string,
  body: Record<string, unknown>,
): Promise<T> {
  if (!region || !clientId) {
    throw new CognitoError(
      'MissingConfiguration',
      'EXPO_PUBLIC_COGNITO_REGION ou EXPO_PUBLIC_COGNITO_CLIENT_ID nao configurado no .env.',
    );
  }

  const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
    },
    body: JSON.stringify({ ClientId: clientId, ...body }),
  });

  const json = await parseBody(response);

  if (!response.ok) {
    const error = json as CognitoErrorBody;
    const rawCode =
      error.__type ?? response.headers.get('x-amzn-ErrorType') ?? `HttpError${response.status}`;
    throw new CognitoError(parseErrorCode(rawCode), error.message ?? error.Message ?? '');
  }

  return json as T;
}
