import { secureStorage } from '@/storage/secureStorage';
import { storageKeys } from '@/storage/storageKeys';
import type { SpendingAlert } from '@/types/spendingAlert';

/**
 * A assinatura muda quando o total ou os dados apresentados pelo backend mudam.
 * Assim, uma dispensa vale para o mesmo alerta, mas um novo gasto na categoria
 * pode voltar a ser comunicado. Esta camada é removível quando o backend passar
 * a ser a fonte única da dispensa.
 */
export function spendingAlertFingerprint(alert: SpendingAlert): string {
  return [
    alert.categoryId,
    alert.totalAmount,
    alert.transactionCount,
    alert.message,
    alert.projection.futureValue,
    alert.projection.years,
    alert.projection.annualRatePct,
  ].join('|');
}

async function getDismissedFingerprints(): Promise<string[]> {
  const value = await secureStorage.getItem(storageKeys.dismissedSpendingAlerts);
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

export async function isSpendingAlertDismissed(alert: SpendingAlert): Promise<boolean> {
  if (alert.dismissedAt) return true;
  return (await getDismissedFingerprints()).includes(spendingAlertFingerprint(alert));
}

export async function dismissSpendingAlertLocally(alert: SpendingAlert): Promise<void> {
  const fingerprint = spendingAlertFingerprint(alert);
  const dismissed = await getDismissedFingerprints();
  if (dismissed.includes(fingerprint)) return;

  await secureStorage.setItem(
    storageKeys.dismissedSpendingAlerts,
    JSON.stringify([...dismissed, fingerprint]),
  );
}
