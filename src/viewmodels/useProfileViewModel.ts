import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { authModel } from '@/models/authModel';

/**
 * VIEWMODEL - acoes da tela de perfil.
 *
 * Logout: RevokeToken no Cognito + limpeza do secureStorage (authModel.signOut)
 * e volta para a tela inicial de autenticacao. Falha na revogacao nao impede a
 * saida.
 */
export function useProfileViewModel() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await authModel.signOut();
    } finally {
      setSigningOut(false);
      router.replace('/(auth)');
    }
  }, [router]);

  return { signingOut, signOut };
}
