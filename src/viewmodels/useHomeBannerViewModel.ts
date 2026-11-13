import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { triageModel } from '@/models/triageModel';

/** 'unknown' enquanto carrega ou se a consulta falhar: a Home mostra só o banner do score. */
export type HomeTriageStatus = 'unknown' | 'pending' | 'completed';

/**
 * VIEWMODEL - qual banner a Home mostra.
 *
 *   GET /api/v1/triage/answers -> 404 = triagem ainda nao feita; 200 = respondida
 *
 * Reconsulta a cada vez que a Home ganha foco, entao ao voltar da triagem o banner ja
 * muda. Falha de rede mantem o ultimo estado conhecido, sem alertar ninguem: o banner
 * e so um atalho.
 */
export function useHomeBannerViewModel() {
  const [triage, setTriage] = useState<HomeTriageStatus>('unknown');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      triageModel
        .getAnswers()
        .then((saved) => {
          if (active) setTriage(saved ? 'completed' : 'pending');
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

  return { triage };
}
