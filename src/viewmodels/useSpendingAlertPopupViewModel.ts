import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { spendingAlertsModel } from '@/models/spendingAlertsModel';
import {
  dismissSpendingAlertLocally,
  isSpendingAlertDismissed,
} from '@/storage/spendingAlertDismissals';
import type { SpendingAlert } from '@/types/spendingAlert';

const ALERT_PERIOD_DAYS = 30;

function largestAlert(alerts: SpendingAlert[]): SpendingAlert | null {
  return alerts.reduce<SpendingAlert | null>(
    (largest, alert) => (!largest || alert.totalAmount > largest.totalAmount ? alert : largest),
    null,
  );
}

/**
 * Controla o popup da Home. A abertura ocorre ao entrar na aba e é silenciosa:
 * falhas no insight não impedem a tela principal de funcionar.
 */
export function useSpendingAlertPopupViewModel() {
  const [alert, setAlert] = useState<SpendingAlert | null>(null);
  const [visible, setVisible] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;

    try {
      const response = await spendingAlertsModel.list(ALERT_PERIOD_DAYS);
      const candidate = largestAlert(response.alerts);
      const dismissed = candidate ? await isSpendingAlertDismissed(candidate) : true;

      if (id !== requestId.current) return;
      setAlert(dismissed ? null : candidate);
      setVisible(!dismissed && candidate !== null);
    } catch {
      if (id !== requestId.current) return;
      setAlert(null);
      setVisible(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {
        requestId.current += 1;
      };
    }, [load]),
  );

  const dismiss = useCallback(async () => {
    const currentAlert = alert;
    setVisible(false);
    setAlert(null);
    if (currentAlert) await dismissSpendingAlertLocally(currentAlert);
  }, [alert]);

  return { alert, dismiss, visible };
}
