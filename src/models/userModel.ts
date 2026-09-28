import { httpClient, HttpError } from '@/config/httpClient';

/**
 * MODEL - usuario autenticado no finup-backend.
 *
 * A identidade vem so do access token do Cognito: nenhum endpoint recebe
 * userId, e-mail ou nome do app. O POST /users le nome e e-mail do proprio
 * Cognito.
 *
 * O Authorization vai explicito em cada chamada ate a tarefa 86e3bcy52 levar
 * isso para dentro do httpClient.
 */

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  birthDate: string | null;
  monthlyIncome: number | null;
  financialProfile: string | null;
  createdAt: string;
  updatedAt: string;
};

// Todos opcionais: o back so atualiza o que vier preenchido. Celular e
// profissao nao existem no back e nao entram aqui.
export type AdditionalInfoPayload = {
  birthDate?: string;
  monthlyIncome?: number;
};

function withToken(accessToken: string): RequestInit {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

export const userModel = {
  getMe: (accessToken: string) =>
    httpClient.get<UserResponse>('/api/v1/users/me', withToken(accessToken)),

  /** POST /users sem corpo. 409 = usuario ja existe para esse token, e segue. */
  ensureCreated: async (accessToken: string): Promise<void> => {
    try {
      await httpClient.post<UserResponse>('/api/v1/users', undefined, withToken(accessToken));
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 409)) {
        throw error;
      }
    }
  },

  updateAdditionalInfo: (accessToken: string, payload: AdditionalInfoPayload) =>
    httpClient.patch<UserResponse>(
      '/api/v1/users/me/additional-info',
      payload,
      withToken(accessToken),
    ),
};
