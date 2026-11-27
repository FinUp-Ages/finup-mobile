/// <reference types="jest" />
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { categoriesModel } from '@/models/categoriesModel';
import { transactionModel } from '@/models/transactionModel';
import type { AnaliseMovement } from '@/types/analise';
import { EditExpenseCategoryModal } from './EditExpenseCategoryModal';
jest.mock('expo-font', () => ({ ...jest.requireActual('expo-font'), isLoaded: () => true, loadAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/models/categoriesModel', () => ({ categoriesModel: { listAvailable: jest.fn() } }));
jest.mock('@/models/transactionModel', () => ({ transactionModel: { changeCategory: jest.fn() } }));
jest.mock('@/models/transactionEvents', () => ({ transactionEvents: { notifyChanged: jest.fn() } }));
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
const movement = { id: '1', title: 'Mercado', type: 'EXPENSE', categoryId: 'old', categoryName: 'Antiga', amount: 'R$ 20', date: '01/01' } as AnaliseMovement;
beforeEach(() => jest.resetAllMocks());

test('seleciona categoria e salva alteração', async () => {
  jest.mocked(categoriesModel.listAvailable).mockResolvedValue([{ id: 'old', type: 'EXPENSE', name: 'Antiga' }, { id: 'new', type: 'EXPENSE', name: 'Nova' }] as never);
  const onClose = jest.fn();
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><EditExpenseCategoryModal movement={movement} onClose={onClose} /></SafeAreaProvider>);
  await waitFor(() => expect(screen.getByLabelText('Categoria: Antiga')).toBeTruthy());
  await fireEvent.press(screen.getByLabelText('Categoria: Antiga'));
  await fireEvent.press(screen.getByLabelText('Nova'));
  await fireEvent.press(screen.getByText('Salvar categoria'));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(transactionModel.changeCategory).toHaveBeenCalledWith('1', { categoryId: 'new' });
});

test('mostra erro de carregamento e permite tentar novamente', async () => {
  jest.mocked(categoriesModel.listAvailable).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><EditExpenseCategoryModal movement={movement} onClose={jest.fn()} /></SafeAreaProvider>);
  await waitFor(() => expect(screen.getByText('Não foi possível carregar as categorias. Tente novamente.')).toBeTruthy());
  await fireEvent.press(screen.getByText('Tentar novamente'));
  await waitFor(() => expect(screen.getByText('Nenhuma categoria de saída disponível.')).toBeTruthy());
});
