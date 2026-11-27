/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { spendingAlertsModel } from '@/models/spendingAlertsModel';
import { dismissSpendingAlertLocally, isSpendingAlertDismissed } from '@/storage/spendingAlertDismissals';
import { useSpendingAlertPopupViewModel } from './useSpendingAlertPopupViewModel';

jest.mock('expo-router', () => {
  const React = require('react');
  return { useFocusEffect: (effect: () => void) => React.useEffect(effect, [effect]) };
});
jest.mock('@/models/spendingAlertsModel', () => ({ spendingAlertsModel: { list: jest.fn() } }));
jest.mock('@/storage/spendingAlertDismissals', () => ({ dismissSpendingAlertLocally: jest.fn(), isSpendingAlertDismissed: jest.fn() }));

beforeEach(() => jest.resetAllMocks());

test('seleciona maior alerta e o dispensa localmente', async () => {
  const largest = { totalAmount: 200, categoryName: 'Lazer' };
  jest.mocked(spendingAlertsModel.list).mockResolvedValue({ alerts: [{ totalAmount: 20 }, largest] } as never);
  jest.mocked(isSpendingAlertDismissed).mockResolvedValue(false);
  const { result } = await renderHook(() => useSpendingAlertPopupViewModel());
  await waitFor(() => expect(result.current.visible).toBe(true));
  expect(result.current.alert).toEqual(largest);
  await act(async () => result.current.dismiss());
  expect(result.current.visible).toBe(false);
  expect(dismissSpendingAlertLocally).toHaveBeenCalledWith(largest);
});

test('não exibe alerta já dispensado', async () => {
  jest.mocked(spendingAlertsModel.list).mockResolvedValue({ alerts: [{ totalAmount: 20 }] } as never);
  jest.mocked(isSpendingAlertDismissed).mockResolvedValue(true);
  const { result } = await renderHook(() => useSpendingAlertPopupViewModel());
  await waitFor(() => expect(isSpendingAlertDismissed).toHaveBeenCalled());
  expect(result.current.visible).toBe(false);
  expect(result.current.alert).toBeNull();
});

test('falha no serviço não abre popup', async () => {
  jest.mocked(spendingAlertsModel.list).mockRejectedValue(new Error('offline'));
  const { result } = await renderHook(() => useSpendingAlertPopupViewModel());
  await waitFor(() => expect(spendingAlertsModel.list).toHaveBeenCalled());
  expect(result.current.visible).toBe(false);
});
