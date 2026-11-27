/// <reference types="jest" />
import { secureStorage } from '@/storage/secureStorage';
import { storageKeys } from '@/storage/storageKeys';
import type { SpendingAlert } from '@/types/spendingAlert';
import { dismissSpendingAlertLocally, isSpendingAlertDismissed, spendingAlertFingerprint } from './spendingAlertDismissals';

jest.mock('@/storage/secureStorage', () => ({ secureStorage: { getItem: jest.fn(), setItem: jest.fn() } }));
const alert: SpendingAlert = { categoryId: 'lazer', categoryName: 'Lazer', riskKind: 'frequência', totalAmount: 200, transactionCount: 3, message: 'Atenção', projection: { futureValue: 500, years: 5, annualRatePct: 10 }, source: 'test' };

beforeEach(() => jest.resetAllMocks());

test('grava e consulta dispensa do alerta, sem duplicá-la', async () => {
  const fingerprint = spendingAlertFingerprint(alert);
  jest.mocked(secureStorage.getItem).mockResolvedValueOnce(null).mockResolvedValue(JSON.stringify([fingerprint]));
  await dismissSpendingAlertLocally(alert);
  expect(secureStorage.setItem).toHaveBeenCalledWith(storageKeys.dismissedSpendingAlerts, JSON.stringify([fingerprint]));
  await expect(isSpendingAlertDismissed(alert)).resolves.toBe(true);
  await dismissSpendingAlertLocally(alert);
  expect(secureStorage.setItem).toHaveBeenCalledTimes(1);
});

test('mudança no gasto gera assinatura diferente; dispensa do backend dispensa leitura local', async () => {
  jest.mocked(secureStorage.getItem).mockResolvedValue(JSON.stringify([spendingAlertFingerprint(alert)]));
  await expect(isSpendingAlertDismissed({ ...alert, totalAmount: 201 })).resolves.toBe(false);
  jest.mocked(secureStorage.getItem).mockClear();
  await expect(isSpendingAlertDismissed({ ...alert, dismissedAt: '2026-01-01' })).resolves.toBe(true);
  expect(secureStorage.getItem).not.toHaveBeenCalled();
});

test('ignora dados inválidos e registra nova dispensa', async () => {
  jest.mocked(secureStorage.getItem).mockResolvedValueOnce('{inválido').mockResolvedValueOnce('["válido", 2]');
  await expect(isSpendingAlertDismissed(alert)).resolves.toBe(false);
  await dismissSpendingAlertLocally(alert);
  expect(secureStorage.setItem).toHaveBeenCalledWith(storageKeys.dismissedSpendingAlerts, JSON.stringify([spendingAlertFingerprint(alert)]));
});

test('propaga falhas de leitura e gravação', async () => {
  jest.mocked(secureStorage.getItem).mockRejectedValueOnce(new Error('leitura')).mockResolvedValueOnce(null);
  jest.mocked(secureStorage.setItem).mockRejectedValueOnce(new Error('gravação'));
  await expect(isSpendingAlertDismissed(alert)).rejects.toThrow('leitura');
  await expect(dismissSpendingAlertLocally(alert)).rejects.toThrow('gravação');
});
