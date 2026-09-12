import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export function useLoadingScreenViewModel() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      // MOCK: simula tempo de verificação de sessão
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // MOCK: troque para 'true' pra testar o fluxo autenticado
      const isAuthenticated = false;

      if (isAuthenticated) {
        router.replace('/(tabs)/profile');
      } else {
        router.replace('/(tabs)/profile');
      }
    }

    checkSession();
  }, []);
}