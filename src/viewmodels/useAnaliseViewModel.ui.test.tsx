/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionModel } from '@/models/transactionModel';
import { useAnaliseViewModel } from './useAnaliseViewModel';

jest.mock('expo-router', () => {
  const React = require('react');
  return { useFocusEffect: (effect: () => void) => React.useEffect(effect, [effect]) };
});
jest.mock('@/models/categoriesModel', () => ({ categoriesModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/transactionModel', () => ({ transactionModel: { list: jest.fn() } }));
jest.mock('@/models/transactionEvents', () => ({ transactionEvents: { subscribe: () => () => {} } }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(categoriesModel.listAvailable).mockResolvedValue([]);
  jest.mocked(transactionModel.list).mockResolvedValue({ transactions: [] } as never);
});

test('carrega lista vazia e permite trocar filtro', async () => {
  const { result } = await renderHook(() => useAnaliseViewModel());
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.movements).toEqual([]);
  await act(async () => result.current.setTypeFilter('EXPENSE'));
  expect(result.current.typeFilter).toBe('EXPENSE');
});

test('permite recuperar erro inicial', async () => {
  jest.mocked(transactionModel.list).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useAnaliseViewModel());
  await waitFor(() => expect(result.current.status).toBe('error'));
  await act(async () => result.current.retry());
  expect(result.current.status).toBe('success');
});
