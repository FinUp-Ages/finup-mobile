/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionModel } from '@/models/transactionModel';
import { userModel } from '@/models/userModel';
import { useHomeViewModel } from './useHomeViewModel';

jest.mock('expo-router', () => {
  const React = require('react');
  return { useFocusEffect: (effect: () => void) => React.useEffect(effect, [effect]) };
});
jest.mock('@/models/categoriesModel', () => ({ categoriesModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/transactionModel', () => ({ BALANCE_FROM: '2000-01-01', transactionModel: { list: jest.fn() } }));
jest.mock('@/models/transactionEvents', () => ({ transactionEvents: { subscribe: () => () => {} } }));
jest.mock('@/models/userModel', () => ({ userModel: { getMe: jest.fn() } }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(userModel.getMe).mockResolvedValue({ name: 'Ana Silva', finUpScore: 80 } as never);
  jest.mocked(transactionModel.list).mockResolvedValue({ balance: 100, transactions: [] } as never);
  jest.mocked(categoriesModel.listAvailable).mockResolvedValue([]);
});

test('carrega saudação, pontuação e saldo', async () => {
  const { result } = await renderHook(() => useHomeViewModel());
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.userName).toBe('Ana');
  expect(result.current.hasScore).toBe(true);
  expect(result.current.balance).toBeTruthy();
  expect(result.current.expenses).toEqual([]);
});

test('falha inicial permite nova tentativa', async () => {
  jest.mocked(userModel.getMe).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useHomeViewModel());
  await waitFor(() => expect(result.current.status).toBe('error'));
  await act(async () => result.current.retry());
  expect(result.current.status).toBe('success');
  expect(result.current.userName).toBe('Ana');
});

test('falha ao carregar categorias não impede Home e filtro pode mudar', async () => {
  jest.mocked(categoriesModel.listAvailable).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useHomeViewModel());
  await waitFor(() => expect(result.current.status).toBe('success'));
  await act(async () => result.current.setTypeFilter('EXPENSE'));
  expect(result.current.typeFilter).toBe('EXPENSE');
  expect(result.current.expenses).toEqual([]);
});
