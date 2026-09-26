import { httpClient } from '@/config/httpClient';
import type { CurrentUser } from '@/types/user';

/**
 * MODEL - usuario correspondente a identidade autenticada (mock, ver
 * httpClient.ts). Usado pra resolver o userId real a enviar em
 * POST /api/v1/transactions sem fixar um UUID hardcoded (os ids sao gerados
 * via gen_random_uuid() no seed do banco, mudam a cada ambiente).
 */
export const currentUserModel = {
  getCurrent: () => httpClient.get<CurrentUser>('/api/v1/users/me'),
};
