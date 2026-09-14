import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * VIEWMODEL - Orquestra acoes e estados da tela inicial de autenticacao.
 *
 * Em conformidade com os criterios de aceite:
 * - Crie sua conta -> navega para o fluxo de cadastro (/(auth)/register)
 * - Ja sou cliente -> navega para o login convencional (/(auth)/login)
 * - Google e Apple -> componentes e handlers preparados para futura integracao (sem auth fake)
 */
export function useAuthInitialViewModel() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Crie sua conta -> fluxo de cadastro
   */
  const handleCreateAccount = useCallback(() => {
    setError(null);
    router.push('/(auth)/register');
  }, [router]);

  /**
   * Ponto de integracao preparado para autenticacao social via Google
   */
  const handleGoogleAuth = useCallback(async () => {
    try {
      setError(null);
      setLoadingProvider('google');
      // Ponto de integracao para autenticacao via Google OAuth (time de integracao)
    } catch {
      setError('Nao foi possivel iniciar a autenticacao com o Google.');
    } finally {
      setLoadingProvider(null);
    }
  }, []);

  /**
   * Ponto de integracao preparado para autenticacao social via Apple ID
   */
  const handleAppleAuth = useCallback(async () => {
    try {
      setError(null);
      setLoadingProvider('apple');
      // Ponto de integracao para autenticacao via Apple ID (time de integracao)
    } catch {
      setError('Nao foi possivel iniciar a autenticacao com a Apple.');
    } finally {
      setLoadingProvider(null);
    }
  }, []);

  /**
   * Ja sou cliente -> fluxo de autenticacao convencional
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
