/** Contrato C1 de insights de gastos de risco. */
export type SpendingAlertProjection = {
  years: number;
  annualRatePct: number;
  futureValue: number;
};

export type SpendingAlert = {
  categoryId: string;
  categoryName: string;
  riskKind: string;
  totalAmount: number;
  transactionCount: number;
  message: string;
  projection: SpendingAlertProjection;
  source: string;
};

export type SpendingAlertsResponse = {
  periodDays: number;
  alerts: SpendingAlert[];
};
