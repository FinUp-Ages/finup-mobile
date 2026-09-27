import * as Crypto from 'expo-crypto';
import { CognitoError, cognitoRequest } from '@/config/cognitoClient';
import { secureStorage } from '@/storage/secureStorage';
import { storageKeys } from '@/storage/storageKeys';

/**
 * MODEL - autenticacao com o AWS Cognito (cadastro, confirmacao, login,
 * renovacao e logout) e sessao no secureStorage.
 *
 * Sem Amplify: as operacoes sao a API publica do Cognito via cognitoClient.
 * O login usa USER_AUTH com PREFERRED_CHALLENGE=PASSWORD, porque o
 * USER_PASSWORD_AUTH esta desligado no app client.
 *
 * Contrato: finup-backend/contracts/auth-mobile-cognito.md (secoes 2, 3 e 6).
 */

export type SignUpInput = {
  // UUID gerado pelo app: o pool nao aceita username em formato de e-mail.
  username: string;
  password: string;
  email: string;
  name: string;
  // AAAA-MM-DD, obrigatorio no pool.
  birthdate: string;
};

type SignUpResponse = {
  UserConfirmed: boolean;
  UserSub: string;
};

type AuthenticationResult = {
  AccessToken: string;
  IdToken?: string;
  RefreshToken?: string;
  ExpiresIn: number;
};

type InitiateAuthResponse = {
  AuthenticationResult?: AuthenticationResult;
  ChallengeName?: string;
};

// O pool nao usa MFA: qualquer challenge no lugar do AuthenticationResult e
// tratado como erro inesperado.
function requireAuthenticationResult(response: InitiateAuthResponse): AuthenticationResult {
  if (!response.AuthenticationResult) {
    throw new CognitoError(
      'UnexpectedChallenge',
      `Challenge inesperado do Cognito: ${response.ChallengeName ?? 'nenhum'}`,
    );
  }
  return response.AuthenticationResult;
}

async function clearSession(): Promise<void> {
  await Promise.all([
    secureStorage.deleteItem(storageKeys.accessToken),
    secureStorage.deleteItem(storageKeys.refreshToken),
  ]);
}

export const authModel = {
  generateUsername: () => Crypto.randomUUID(),

  signUp: (input: SignUpInput) =>
    cognitoRequest<SignUpResponse>('SignUp', {
      Username: input.username,
      Password: input.password,
      UserAttributes: [
        { Name: 'email', Value: input.email },
        { Name: 'name', Value: input.name },
        { Name: 'birthdate', Value: input.birthdate },
      ],
    }),

  confirmSignUp: async (username: string, code: string): Promise<void> => {
    await cognitoRequest('ConfirmSignUp', { Username: username, ConfirmationCode: code });
  },

  resendCode: async (username: string): Promise<void> => {
    await cognitoRequest('ResendConfirmationCode', { Username: username });
  },

  /**
   * Login com senha. `username` e o UUID no cadastro e o e-mail no login.
   * Guarda access e refresh token e devolve o access token.
   */
  signIn: async (username: string, password: string): Promise<string> => {
    const response = await cognitoRequest<InitiateAuthResponse>('InitiateAuth', {
      AuthFlow: 'USER_AUTH',
      AuthParameters: {
        USERNAME: username,
        PREFERRED_CHALLENGE: 'PASSWORD',
        PASSWORD: password,
      },
    });
    const result = requireAuthenticationResult(response);
    if (!result.RefreshToken) {
      throw new CognitoError('MissingRefreshToken', 'O Cognito nao devolveu o refresh token.');
    }

    await secureStorage.setItem(storageKeys.accessToken, result.AccessToken);
    await secureStorage.setItem(storageKeys.refreshToken, result.RefreshToken);
    return result.AccessToken;
  },

  hasSession: async (): Promise<boolean> =>
    Boolean(await secureStorage.getItem(storageKeys.refreshToken)),

  getAccessToken: () => secureStorage.getItem(storageKeys.accessToken),

  /**
   * Renova o access token pelo refresh token e devolve o novo.
   *
   * Refresh expirado ou revogado (NotAuthorizedException) limpa a sessao. Outras
   * falhas (ex.: sem internet) mantem os tokens, para tentar de novo depois.
   */
  refreshSession: async (): Promise<string> => {
    const refreshToken = await secureStorage.getItem(storageKeys.refreshToken);
    if (!refreshToken) {
      throw new CognitoError('NoSession', 'Nenhuma sessao salva.');
    }

    let response: InitiateAuthResponse;
    try {
      response = await cognitoRequest<InitiateAuthResponse>('InitiateAuth', {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      });
    } catch (error) {
      if (error instanceof CognitoError && error.code === 'NotAuthorizedException') {
        await clearSession();
      }
      throw error;
    }

    const result = requireAuthenticationResult(response);
    await secureStorage.setItem(storageKeys.accessToken, result.AccessToken);
    // So vem um refresh token novo se o pool tiver rotacao ligada.
    if (result.RefreshToken) {
      await secureStorage.setItem(storageKeys.refreshToken, result.RefreshToken);
    }
    return result.AccessToken;
  },

  clearSession,

  /**
   * Revoga o refresh token no Cognito e limpa o secureStorage. Falha na
   * revogacao nao impede o logout: a sessao local e apagada do mesmo jeito.
   */
  signOut: async (): Promise<void> => {
    const refreshToken = await secureStorage.getItem(storageKeys.refreshToken);
    if (refreshToken) {
      try {
        await cognitoRequest('RevokeToken', { Token: refreshToken });
      } catch (error) {
        if (__DEV__) {
          console.warn('[auth] RevokeToken falhou; limpando a sessao local mesmo assim.', error);
        }
      }
    }
    await clearSession();
  },
};

export type AuthOperation = 'signUp' | 'confirmSignUp' | 'resendCode' | 'signIn';

const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

// Traducao da mensagem do InvalidPasswordException ("Password did not conform
// with policy: Password must have uppercase characters"): a regex do app pode
// ser mais fraca que a politica do pool.
function passwordPolicyMessage(cognitoMessage: string): string {
  const message = cognitoMessage.toLowerCase();
  if (message.includes('uppercase')) return 'A senha precisa ter pelo menos uma letra maiúscula.';
  if (message.includes('lowercase')) return 'A senha precisa ter pelo menos uma letra minúscula.';
  if (message.includes('numeric')) return 'A senha precisa ter pelo menos um número.';
  if (message.includes('symbol')) return 'A senha precisa ter pelo menos um símbolo.';
  if (message.includes('long enough')) return 'A senha é curta demais.';
  return 'A senha não atende aos requisitos.';
}

/**
 * Mensagem para a pessoa usuaria a partir de um erro do Cognito (secao 6 do
 * contrato). `operation` separa os casos em que a mesma excecao significa coisas
 * diferentes (ex.: NotAuthorizedException).
 */
export function authErrorMessage(error: unknown, operation: AuthOperation): string {
  if (!(error instanceof CognitoError)) {
    // fetch() rejeita com TypeError quando nao ha rede.
    return error instanceof TypeError
      ? 'Sem conexão com a internet. Verifique e tente novamente.'
      : GENERIC_MESSAGE;
  }

  switch (error.code) {
    case 'InvalidPasswordException':
      return passwordPolicyMessage(error.message);
    case 'InvalidParameterException':
      return 'Algum dado do cadastro é inválido. Confira e tente novamente.';
    case 'CodeMismatchException':
      return 'Código incorreto.';
    case 'ExpiredCodeException':
      return 'Código expirado. Toque em "Reenviar código".';
    case 'AliasExistsException':
      return 'Este e-mail já está cadastrado.';
    case 'CodeDeliveryFailureException':
      return 'Não foi possível enviar o código para este e-mail.';
    case 'LimitExceededException':
    case 'TooManyRequestsException':
    case 'TooManyFailedAttemptsException':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'NotAuthorizedException':
    case 'UserNotFoundException':
      // Nao revela se a conta existe.
      return operation === 'signIn' ? 'E-mail ou senha incorretos.' : GENERIC_MESSAGE;
    case 'UserNotConfirmedException':
      return 'Conta não confirmada. Use o código enviado para o seu e-mail.';
    default:
      return GENERIC_MESSAGE;
  }
}
