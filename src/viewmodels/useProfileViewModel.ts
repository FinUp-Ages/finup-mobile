import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError(false);
    try {
      const result = await triageModel.getAssessment();
      if (currentRequest === requestId.current) setAssessment(result);
    } catch {
      if (currentRequest === requestId.current) setLoadError(true);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void load();
    return () => { requestId.current += 1; };
  }, [load]));

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
    retry: load,
    openTriage: () => router.push('/triage'),
  };
}
