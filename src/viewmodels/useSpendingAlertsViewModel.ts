import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { spendingAlertsModel } from '@/models/spendingAlertsModel';
import { transactionEvents } from '@/models/transactionEvents';
import type { SpendingAlert, SpendingAlertsResponse } from '@/types/spendingAlert';

const ALERT_PERIOD_DAYS = 30;

type SpendingAlertsStatus = 'loading' | 'success' | 'error';

/**
 * Dados reutilizáveis de alertas C1. A aba Análise mostra somente o primeiro
 * alerta, pois o backend já devolve a lista ordenada por relevância.
 */
export function useSpendingAlertsViewModel() {
  const [status, setStatus] = useState<SpendingAlertsStatus>('loading');
  const [data, setData] = useState<SpendingAlertsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async (mode: 'initial' | 'pull' | 'silent') => {
    const id = ++requestId.current;
    if (mode === 'initial') setStatus('loading');
    if (mode === 'pull') setRefreshing(true);

    try {
      const next = await spendingAlertsModel.list(ALERT_PERIOD_DAYS);
      if (id !== requestId.current) return;
      setData(next);
      setStatus('success');
    } catch {
      if (id !== requestId.current) return;
      // O alerta é complementar: uma falha não interfere nos demais dados da Análise.
      setData(null);
      setStatus('error');
    } finally {
      if (id === requestId.current) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load('initial');
    }, [load]),
  );

  useEffect(
    () =>
      transactionEvents.subscribe(() => {
        void load('silent');
      }),
    [load],
  );

  return {
    alert: (data?.alerts[0] ?? null) as SpendingAlert | null,
    refreshing,
    refresh: () => load('pull'),
    status,
  };
}
