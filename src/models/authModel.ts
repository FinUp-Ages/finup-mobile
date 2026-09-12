import { secureStorage } from '@/storage/secureStorage';
import { STORAGE_KEYS } from '@/storage/storageKeys';
import type { AuthSuccessResponse, UserSession } from '@/types/auth';

/**
 * MODEL - Camada de acesso aos servicos de autenticacao.
 *
 * Oferece metodos mockados para testes locais e desenvolvimento de front,
 * persistindo a sessao e token com seguranca no SecureStore.
 */
export const authModel = {
  /**
   * Mock de autenticacao via Google OAuth.
   */
  async mockLoginGoogle(): Promise<AuthSuccessResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser: UserSession = {
      id: 'usr_mock_google_123',
      name: 'Usuario Google Demo',
      email: 'usuario.demo@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      provider: 'google',
    };

    const response: AuthSuccessResponse = {
      token: 'mock_jwt_token_google_finup_' + Date.now(),
      user: mockUser,
    };

    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await secureStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(response.user));

    return response;
  },

  /**
   * Mock de autenticacao via Apple ID.
   */
  async mockLoginApple(): Promise<AuthSuccessResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser: UserSession = {
      id: 'usr_mock_apple_456',
      name: 'Usuario Apple Demo',
      email: 'usuario.demo@apple.com',
      provider: 'apple',
    };

    const response: AuthSuccessResponse = {
      token: 'mock_jwt_token_apple_finup_' + Date.now(),
      user: mockUser,
    };

    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await secureStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(response.user));

    return response;
  },

  /**
   * Mock de autenticacao para cliente existente ("Ja sou cliente").
   */
  async mockLoginCustomer(): Promise<AuthSuccessResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockUser: UserSession = {
      id: 'usr_mock_customer_789',
      name: 'Gabriel Mendonca (FinUp)',
      email: 'gabriel.finup@ages.edu.br',
      provider: 'email',
    };

    const response: AuthSuccessResponse = {
      token: 'mock_jwt_token_customer_finup_' + Date.now(),
      user: mockUser,
    };

    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await secureStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(response.user));

    return response;
  },

  /**
   * Obtem a sessao salva no SecureStore.
   */
  async getStoredSession(): Promise<UserSession | null> {
    const sessionStr = await secureStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr) as UserSession;
    } catch {
      return null;
    }
  },

  /**
   * Limpa a sessao salva (Logout).
   */
  async logout(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  },
};
