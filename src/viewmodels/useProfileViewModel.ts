import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { authModel } from '@/models/authModel';
import { triageModel } from '@/models/triageModel';
import type { AssessmentResponse } from '@/types/triage';

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
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    void triageModel.getAssessment().then((result) => {
      if (active) setAssessment(result);
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [retry]));

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await authModel.signOut();
    } finally {
      setSigningOut(false);
      router.replace('/(auth)');
    }
  }, [router]);

  return {
    signingOut, signOut, assessment, loading, loadError,
    retry: () => setRetry((previous) => previous + 1),
    openTriage: () => router.push('/triage'),
  };
}
