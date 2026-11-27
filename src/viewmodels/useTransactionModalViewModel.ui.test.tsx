/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { categoriesModel } from '@/models/categoriesModel';
import { paymentMethodsModel } from '@/models/paymentMethodsModel';
import { transactionModel } from '@/models/transactionModel';
import { useTransactionModalViewModel } from './useTransactionModalViewModel';

jest.mock('@/models/categoriesModel', () => ({ categoriesModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/paymentMethodsModel', () => ({ paymentMethodsModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/transactionModel', () => ({ transactionModel: { create: jest.fn() }, transactionErrorMessage: () => 'Erro ao salvar' }));
jest.mock('@/utils/dates', () => ({ todayIsoDate: () => '2026-01-02' }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(categoriesModel.listAvailable).mockResolvedValue([{ id: 'out', type: 'EXPENSE' }, { id: 'in', type: 'INCOME' }] as never);
  jest.mocked(paymentMethodsModel.listAvailable).mockResolvedValue([]);
});

test('filtra categorias e impede envio incompleto', async () => {
  const onClose = jest.fn();
  const { result } = await renderHook(() => useTransactionModalViewModel({ type: 'EXPENSE', onClose }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.categories.map((item) => item.id)).toEqual(['out']);
  await act(async () => result.current.submit());
  expect(result.current.errors).toEqual({ amount: true, category: true });
  expect(transactionModel.create).not.toHaveBeenCalled();
});

test('envia transação válida e fecha após sucesso', async () => {
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  const { result } = await renderHook(() => useTransactionModalViewModel({ type: 'EXPENSE', onClose, onSuccess }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { result.current.setAmount(42); result.current.setCategoryId('out'); });
  await act(async () => result.current.submit());
  expect(transactionModel.create).toHaveBeenCalledWith({ categoryId: 'out', paymentMethodId: null, type: 'EXPENSE', amount: 42, transactionDate: '2026-01-02', isRecurring: false });
  expect(onSuccess).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('mantém o formulário aberto quando salvar falha', async () => {
  jest.mocked(transactionModel.create).mockRejectedValueOnce(new Error('offline'));
  const onClose = jest.fn();
  const { result } = await renderHook(() => useTransactionModalViewModel({ type: 'EXPENSE', onClose }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { result.current.setAmount(10); result.current.setCategoryId('out'); });
  await act(async () => result.current.submit());
  expect(result.current.submitError).toBe('Erro ao salvar');
  expect(result.current.submitting).toBe(false);
  expect(onClose).not.toHaveBeenCalled();
});

test('falha parcial mantém categorias carregadas e mostra erro de rede', async () => {
  jest.mocked(paymentMethodsModel.listAvailable).mockRejectedValueOnce(new TypeError('offline'));
  const { result } = await renderHook(() => useTransactionModalViewModel({ type: 'EXPENSE', onClose: jest.fn() }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.categories).toHaveLength(1);
  expect(result.current.loadError).toBe('Sem conexão com a internet. Verifique e tente novamente.');
});
