import { httpClient, HttpError } from '@/config/httpClient';

/**
 * MODEL - usuario autenticado no finup-backend.
 *
 * A identidade vem so do access token do Cognito, que o httpClient injeta em
 * toda chamada: nenhum endpoint recebe userId, e-mail ou nome do app. O
 * POST /users le nome e e-mail do proprio Cognito.
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

export const userModel = {
  /**
   * Consulta publica (sem token: no cadastro ainda nao ha sessao). true = nenhum
   * usuario usa o e-mail. So enxerga o banco do back e nao reserva o e-mail.
   */
  isEmailAvailable: async (email: string): Promise<boolean> => {
    const { available } = await httpClient.post<{ available: boolean }>(
      '/api/v1/users/email-availability',
      { email },
      { auth: false },
    );
    return available;
  },

  getMe: () => httpClient.get<UserResponse>('/api/v1/users/me'),

  /** POST /users sem corpo. 409 = usuario ja existe para esse token, e segue. */
  ensureCreated: async (): Promise<void> => {
    try {
      await httpClient.post<UserResponse>('/api/v1/users', undefined);
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 409)) {
        throw error;
      }
    }
  },

  updateAdditionalInfo: (payload: AdditionalInfoPayload) =>
    httpClient.patch<UserResponse>('/api/v1/users/me/additional-info', payload),
};
