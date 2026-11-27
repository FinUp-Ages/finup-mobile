/// <reference types="jest" />
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { categoriesModel } from '@/models/categoriesModel';
import { paymentMethodsModel } from '@/models/paymentMethodsModel';
import { transactionModel } from '@/models/transactionModel';
import { TransactionModal } from './TransactionModal';

jest.mock('expo-font', () => ({ ...jest.requireActual('expo-font'), isLoaded: () => true, loadAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/models/categoriesModel', () => ({ categoriesModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/paymentMethodsModel', () => ({ paymentMethodsModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/transactionModel', () => ({
  transactionModel: { create: jest.fn() },
  transactionErrorMessage: () => 'Não foi possível salvar.',
}));
jest.mock('@/utils/dates', () => ({ todayIsoDate: () => '2026-01-02' }));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(categoriesModel.listAvailable).mockResolvedValue([
    { id: 'expense', name: 'Mercado', type: 'EXPENSE' },
    { id: 'income', name: 'Salário', type: 'INCOME' },
  ] as never);
  jest.mocked(paymentMethodsModel.listAvailable).mockResolvedValue([{ id: 'card', name: 'Cartão' }] as never);
});

test('impede envio sem valor e categoria e filtra opções pelo tipo', async () => {
  const onClose = jest.fn();
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible type="EXPENSE" balance={100} onClose={onClose} /></SafeAreaProvider>);
  await fireEvent.press(screen.getByText('Salvar saída'));
  expect(transactionModel.create).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByLabelText('Categoria'));
  await waitFor(() => expect(screen.getByLabelText('Mercado')).toBeTruthy());
  expect(screen.queryByLabelText('Salário')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Fechar'));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('seleciona categoria e pagamento e salva saída com valor digitado', async () => {
  const onClose = jest.fn(), onSuccess = jest.fn();
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible type="EXPENSE" balance={100} onClose={onClose} onSuccess={onSuccess} /></SafeAreaProvider>);
  await fireEvent.changeText(screen.getByLabelText('Valor'), '4250');
  await fireEvent.press(screen.getByLabelText('Categoria'));
  await waitFor(() => expect(screen.getByLabelText('Mercado')).toBeTruthy());
  await fireEvent.press(screen.getByLabelText('Mercado'));
  await fireEvent.press(screen.getByLabelText('Pagamento'));
  await waitFor(() => expect(screen.getByLabelText('Cartão')).toBeTruthy());
  await fireEvent.press(screen.getByLabelText('Cartão'));
  expect(screen.getByLabelText('Categoria: Mercado')).toBeTruthy();
  expect(screen.getByLabelText('Pagamento: Cartão')).toBeTruthy();
  await fireEvent.press(screen.getByText('Salvar saída'));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(transactionModel.create).toHaveBeenCalledWith({ categoryId: 'expense', paymentMethodId: 'card', type: 'EXPENSE', amount: 42.5, transactionDate: '2026-01-02', isRecurring: false });
  expect(onSuccess).toHaveBeenCalledTimes(1);
});

test('mostra erro de envio e mantém formulário aberto', async () => {
  jest.mocked(transactionModel.create).mockRejectedValueOnce(new Error('offline'));
  const onClose = jest.fn(), onSuccess = jest.fn();
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible type="INCOME" balance={null} onClose={onClose} onSuccess={onSuccess} /></SafeAreaProvider>);
  expect(screen.getByText('—')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Valor'), '1000');
  await fireEvent.press(screen.getByLabelText('Categoria'));
  await waitFor(() => expect(screen.getByLabelText('Salário')).toBeTruthy());
  await fireEvent.press(screen.getByLabelText('Salário'));
  await fireEvent.press(screen.getByText('Salvar entrada'));
  await waitFor(() => expect(screen.getByText('Não foi possível salvar.')).toBeTruthy());
  expect(onClose).not.toHaveBeenCalled();
  expect(onSuccess).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Categoria: Salário')).toBeTruthy();
});

test('exibe erro de carregamento e mensagem de opções vazias', async () => {
  jest.mocked(categoriesModel.listAvailable).mockRejectedValueOnce(new TypeError('offline'));
  jest.mocked(paymentMethodsModel.listAvailable).mockResolvedValueOnce([]);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible type="EXPENSE" balance={0} onClose={jest.fn()} /></SafeAreaProvider>);
  await waitFor(() => expect(screen.getByText('Sem conexão com a internet. Verifique e tente novamente.')).toBeTruthy());
  await fireEvent.press(screen.getByLabelText('Categoria'));
  expect(screen.getByText('Nenhuma categoria disponível.')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Pagamento'));
  expect(screen.getByText('Nenhum método de pagamento cadastrado.')).toBeTruthy();
});

test('permite desmarcar pagamento opcional antes de salvar', async () => {
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible type="EXPENSE" balance={0} onClose={jest.fn()} /></SafeAreaProvider>);
  await fireEvent.changeText(screen.getByLabelText('Valor'), '100');
  await fireEvent.press(screen.getByLabelText('Categoria'));
  await waitFor(() => expect(screen.getByLabelText('Mercado')).toBeTruthy());
  await fireEvent.press(screen.getByLabelText('Mercado'));
  await fireEvent.press(screen.getByLabelText('Pagamento'));
  await fireEvent.press(screen.getByLabelText('Cartão'));
  await fireEvent.press(screen.getByLabelText('Pagamento: Cartão'));
  await fireEvent.press(screen.getByLabelText('Cartão'));
  expect(screen.getByLabelText('Pagamento')).toBeTruthy();
  await fireEvent.press(screen.getByText('Salvar saída'));
  await waitFor(() => expect(transactionModel.create).toHaveBeenCalledWith(expect.objectContaining({ paymentMethodId: null })));
});

test('modal oculto não carrega dados e reabertura limpa seleção', async () => {
  const onClose = jest.fn();
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible={false} type="EXPENSE" balance={0} onClose={onClose} /></SafeAreaProvider>);
  expect(categoriesModel.listAvailable).not.toHaveBeenCalled();
  await screen.rerender(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible type="EXPENSE" balance={0} onClose={onClose} /></SafeAreaProvider>);
  await fireEvent.changeText(screen.getByLabelText('Valor'), '500');
  await screen.rerender(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible={false} type="EXPENSE" balance={0} onClose={onClose} /></SafeAreaProvider>);
  await screen.rerender(<SafeAreaProvider initialMetrics={metrics}><TransactionModal visible type="EXPENSE" balance={0} onClose={onClose} /></SafeAreaProvider>);
  expect(screen.getByLabelText('Valor').props.value).toBe('');
});
