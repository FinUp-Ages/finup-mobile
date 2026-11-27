/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { transactionModel } from '@/models/transactionModel';
import { useTransacaoViewModel } from './useTransacaoViewModel';

jest.mock('@/models/transactionModel', () => ({ BALANCE_FROM: '2000-01-01', transactionModel: { list: jest.fn() } }));
jest.mock('@/models/transactionEvents', () => ({ transactionEvents: { subscribe: jest.fn(() => () => {}) } }));
jest.mock('@/utils/dates', () => ({ todayIsoDate: () => '2026-01-02' }));

beforeEach(() => jest.resetAllMocks());

test('carrega saldo e controla modal sem perder o tipo ao fechar', async () => {
  jest.mocked(transactionModel.list).mockResolvedValue({ balance: 123 } as never);
  const { result } = await renderHook(() => useTransacaoViewModel());
  await waitFor(() => expect(result.current.balanceValue).toBe(123));
  expect(transactionModel.list).toHaveBeenCalledWith('2000-01-01', '2026-01-02');
  await act(async () => result.current.openModal('EXPENSE'));
  expect(result.current.modalVisible).toBe(true);
  await act(async () => result.current.closeModal());
  expect(result.current.modalVisible).toBe(false);
  expect(result.current.modalType).toBe('EXPENSE');
});

test('permite recuperar saldo após erro', async () => {
  jest.mocked(transactionModel.list).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ balance: 50 } as never);
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const { result } = await renderHook(() => useTransacaoViewModel());
    await waitFor(() => expect(result.current.balance.status).toBe('error'));
    expect(result.current.balanceValue).toBeNull();
    await act(async () => result.current.retryBalance());
    await waitFor(() => expect(result.current.balanceValue).toBe(50));
  } finally { warning.mockRestore(); }
});
