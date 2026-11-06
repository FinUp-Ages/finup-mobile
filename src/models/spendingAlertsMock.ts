import type { SpendingAlertsResponse } from '@/types/spendingAlert';

/** Mock temporário do contrato C1, usado somente com EXPO_PUBLIC_USE_MOCKS=true. */
export function spendingAlertsMock(days: number): SpendingAlertsResponse {
  return {
    periodDays: days,
    alerts: [
      {
        categoryId: 'd3b07384-d113-4e4e-b5f7-9b2f6b8c9d10',
        categoryName: 'Apostas',
        riskKind: 'BETS',
        totalAmount: 3000,
        transactionCount: 4,
        message: `R$ 3.000,00 em apostas nos últimos ${days} dias.`,
        projection: {
          years: 5,
          annualRatePct: 10,
          futureValue: 4831.53,
        },
        source: 'RULE',
      },
    ],
  };
}
