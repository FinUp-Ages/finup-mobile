import { httpClient } from '@/config/httpClient';
import { spendingAlertsMock } from '@/models/spendingAlertsMock';
import type { SpendingAlertsResponse } from '@/types/spendingAlert';

const useMocks = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

/** MODEL - alertas de gasto de risco calculados pelo backend (contrato C1). */
export const spendingAlertsModel = {
  list: (days: number): Promise<SpendingAlertsResponse> =>
    useMocks
      ? Promise.resolve(spendingAlertsMock(days))
      : httpClient.get<SpendingAlertsResponse>(`/api/v1/insights/spending-alerts?days=${days}`),
};
