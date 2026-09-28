import { useEffect } from 'react';
import { useRouter, type Href } from 'expo-router';
import { HttpError } from '@/config/httpClient';
import { authModel } from '@/models/authModel';
import { userModel } from '@/models/userModel';

/**
 * Decide a primeira tela a partir da sessao salva (contrato
 * finup-backend/contracts/auth-mobile-cognito.md, secao 4):
 *
 *   sem refresh token -> tela inicial de autenticacao
 *   com refresh token -> refreshSession()
 *     ok    -> GET /users/me (200 -> Home; 404 -> retoma o cadastro)
 *     falha -> tela inicial (refresh expirado/revogado ja limpa a sessao)
 */
async function resolveInitialRoute(): Promise<Href> {
  if (!(await authModel.hasSession())) {
    return '/(auth)';
  }

  let accessToken: string;
  try {
    accessToken = await authModel.refreshSession();
  } catch {
    return '/(auth)';
  }

  try {
    await userModel.getMe(accessToken);
    return '/profile';
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return { pathname: '/(auth)/cadastro', params: { retomar: '1' } };
    }
    if (error instanceof HttpError && error.status === 401) {
      await authModel.clearSession();
    }
    return '/(auth)';
  }
}

export function useLoadingScreenViewModel() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      router.replace(await resolveInitialRoute());
    }

    checkSession();
  }, [router]);
}
