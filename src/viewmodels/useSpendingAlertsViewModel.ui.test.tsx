/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { spendingAlertsModel } from '@/models/spendingAlertsModel';
import { useSpendingAlertsViewModel } from './useSpendingAlertsViewModel';

jest.mock('expo-router', () => {
  const React = require('react');
  return { useFocusEffect: (effect: () => void) => React.useEffect(effect, [effect]) };
});
jest.mock('@/models/spendingAlertsModel', () => ({ spendingAlertsModel: { list: jest.fn() } }));
jest.mock('@/models/transactionEvents', () => ({ transactionEvents: { subscribe: () => () => {} } }));

beforeEach(() => jest.resetAllMocks());

test('apresenta o primeiro alerta recebido', async () => {
  jest.mocked(spendingAlertsModel.list).mockResolvedValue({ alerts: [{ id: 'primeiro' }, { id: 'segundo' }] } as never);
  const { result } = await renderHook(() => useSpendingAlertsViewModel());
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.alert).toMatchObject({ id: 'primeiro' });
  expect(spendingAlertsModel.list).toHaveBeenCalledWith(30);
});

test('recupera a lista após falha', async () => {
  jest.mocked(spendingAlertsModel.list).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ alerts: [] } as never);
  const { result } = await renderHook(() => useSpendingAlertsViewModel());
  await waitFor(() => expect(result.current.status).toBe('error'));
  await act(async () => result.current.refresh());
  expect(result.current.status).toBe('success');
  expect(result.current.alert).toBeNull();
  expect(result.current.refreshing).toBe(false);
});
