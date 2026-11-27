/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { AnaliseMovement } from '@/types/analise';
import { AnaliseMovimentacoesModal } from './AnaliseMovimentacoesModal';
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
const props = { onClose: jest.fn(), onSelectPeriod: jest.fn(), onSelectSortOrder: jest.fn(), periodKey: '30D' as never, periodLabel: '30 dias', sortOrder: 'NEWEST' as const, visible: true, editingExpense: false, onEditExpense: jest.fn() };
beforeEach(() => jest.clearAllMocks());

test('mostra estado vazio e fecha modal', async () => {
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><AnaliseMovimentacoesModal {...props} movements={[]} /></SafeAreaProvider>);
  expect(screen.getByText('Sem transações no período')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Fechar transações'));
  expect(props.onClose).toHaveBeenCalledTimes(1);
});

test('permite editar saída, mas não entrada', async () => {
  const expense = { id: '1', title: 'Mercado', categoryName: 'Alimentação', amount: 'R$ 20', date: '01/01', type: 'EXPENSE' } as AnaliseMovement;
  const income = { ...expense, id: '2', title: 'Salário', type: 'INCOME' } as AnaliseMovement;
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><AnaliseMovimentacoesModal {...props} movements={[expense, income]} /></SafeAreaProvider>);
  await fireEvent.press(screen.getByLabelText('Mercado, Alimentação, R$ 20, 01/01. Editar categoria'));
  await fireEvent.press(screen.getByLabelText('Salário, Alimentação, R$ 20, 01/01'));
  expect(props.onEditExpense).toHaveBeenCalledTimes(1);
  expect(props.onEditExpense).toHaveBeenCalledWith(expense);
});
