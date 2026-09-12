import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { authModel } from '@/models/authModel';

/**
 * VIEWMODEL - Orquestra acoes e estados da tela inicial de autenticacao / login.
 *
 * Utiliza o authModel para execucao dos fluxos mockados e navegacao para
 * a area logada (tabs) com seguranca.
 */
export function useAuthInitialViewModel() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | 'customer' | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Direciona para o fluxo de cadastro de nova conta.
   */
  const handleCreateAccount = useCallback(() => {
    setError(null);
    router.push('/(auth)/register');
  }, [router]);

  /**
   * Autenticacao via Google (com mock de teste e persistencia segura).
   */
  const handleGoogleAuth = useCallback(async () => {
    try {
      setError(null);
      setLoadingProvider('google');

      await authModel.mockLoginGoogle();

      // Navega para as abas autenticadas do aplicativo
      router.replace('/(tabs)');
    } catch {
      setError('Nao foi possivel autenticar com o Google. Tente novamente.');
    } finally {
      setLoadingProvider(null);
    }
  }, [router]);

  /**
   * Autenticacao via Apple ID (com mock de teste e persistencia segura).
   */
  const handleAppleAuth = useCallback(async () => {
    try {
      setError(null);
      setLoadingProvider('apple');

      await authModel.mockLoginApple();

      // Navega para as abas autenticadas do aplicativo
      router.replace('/(tabs)');
    } catch {
      setError('Nao foi possivel autenticar com a Apple. Tente novamente.');
    } finally {
      setLoadingProvider(null);
    }
  }, [router]);

  /**
   * Fluxo "Ja sou cliente" (login mockado direto para demonstracao).
   */
  const handleAlreadyCustomer = useCallback(async () => {
    try {
      setError(null);
      setLoadingProvider('customer');

      await authModel.mockLoginCustomer();

      // Navega para as abas autenticadas do aplicativo
      router.replace('/(tabs)');
    } catch {
      setError('Falha ao autenticar cliente. Tente novamente.');
    } finally {
      setLoadingProvider(null);
    }
  }, [router]);

  return {
    isLoadingGoogle: loadingProvider === 'google',
    isLoadingApple: loadingProvider === 'apple',
    isLoadingCustomer: loadingProvider === 'customer',
    isAnyLoading: loadingProvider !== null,
    error,
    handleCreateAccount,
    handleGoogleAuth,
    handleAppleAuth,
    handleAlreadyCustomer,
  };
}
