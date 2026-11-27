/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionModel } from '@/models/transactionModel';
import { transactionEvents } from '@/models/transactionEvents';
import { useEditExpenseCategoryViewModel } from './useEditExpenseCategoryViewModel';

jest.mock('@/models/categoriesModel', () => ({ categoriesModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/transactionModel', () => ({ transactionModel: { changeCategory: jest.fn() } }));
jest.mock('@/models/transactionEvents', () => ({ transactionEvents: { notifyChanged: jest.fn() } }));

const movement = { id: 't1', type: 'EXPENSE', categoryId: 'old' } as never;
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(categoriesModel.listAvailable).mockResolvedValue([{ id: 'old', type: 'EXPENSE' }, { id: 'new', type: 'EXPENSE' }, { id: 'income', type: 'INCOME' }] as never);
});

test('salva somente a categoria alterada e notifica outras telas', async () => {
  const onClose = jest.fn();
  const { result } = await renderHook(() => useEditExpenseCategoryViewModel({ movement, onClose }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.categories).toHaveLength(2);
  expect(result.current.canSave).toBe(false);
  await act(async () => result.current.selectCategory('new'));
  expect(result.current.canSave).toBe(true);
  await act(async () => result.current.save());
  expect(transactionModel.changeCategory).toHaveBeenCalledWith('t1', { categoryId: 'new' });
  expect(transactionEvents.notifyChanged).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('mantém seleção e mostra erro de conexão ao falhar salvamento', async () => {
  jest.mocked(transactionModel.changeCategory).mockRejectedValueOnce(new TypeError('offline'));
  const onClose = jest.fn();
  const { result } = await renderHook(() => useEditExpenseCategoryViewModel({ movement, onClose }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => result.current.selectCategory('new'));
  await act(async () => result.current.save());
  expect(result.current.categoryId).toBe('new');
  expect(result.current.submitError).toContain('Sem conexão');
  expect(onClose).not.toHaveBeenCalled();
});

test('permite nova tentativa quando categorias falham', async () => {
  jest.mocked(categoriesModel.listAvailable).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useEditExpenseCategoryViewModel({ movement, onClose: jest.fn() }));
  await waitFor(() => expect(result.current.loadError).not.toBeNull());
  await act(async () => result.current.retry());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.loadError).toBeNull();
  expect(result.current.categories).toHaveLength(2);
});
