import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * VIEWMODEL - Orquestra ações e estados da tela inicial de autenticação.
 *
 * Não expõe credenciais sensíveis no frontend. A View apenas observa o estado
 * e dispara os callbacks.
 */
export function useAuthInitialViewModel() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Direciona para o fluxo de cadastro de nova conta.
   */
  const handleCreateAccount = useCallback(() => {
    setError(null);
    router.push('/(auth)/register');
  }, [router]);

  /**
   * Preparado para autenticação via Google OAuth.
   */
  const handleGoogleAuth = useCallback(async () => {
    try {
      setError(null);
      setLoadingProvider('google');

      // Placeholder preparado para integração futura com fluxo OAuth / Backend
      // Nenhuma credencial ou token privado fica embutido no frontend.
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      setError('Não foi possível autenticar com o Google. Tente novamente.');
    } finally {
      setLoadingProvider(null);
    }
  }, []);

  /**
   * Preparado para autenticação via Apple ID.
   */
  const handleAppleAuth = useCallback(async () => {
    try {
      setError(null);
      setLoadingProvider('apple');

      // Placeholder preparado para integração futura com fluxo OAuth / Backend
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      setError('Não foi possível autenticar com a Apple. Tente novamente.');
    } finally {
      setLoadingProvider(null);
    }
  }, []);

  /**
   * Direciona para o fluxo de login de cliente existente.
   */
  const handleAlreadyCustomer = useCallback(() => {
    setError(null);
    router.push('/(auth)/login');
  }, [router]);

  return {
    isLoadingGoogle: loadingProvider === 'google',
    isLoadingApple: loadingProvider === 'apple',
    isAnyLoading: loadingProvider !== null,
    error,
    handleCreateAccount,
    handleGoogleAuth,
    handleAppleAuth,
    handleAlreadyCustomer,
  };
}
