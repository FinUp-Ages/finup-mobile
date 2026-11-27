/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAnaliseViewModel } from '@/viewmodels/useAnaliseViewModel';
import AnaliseScreen from './AnaliseScreen';
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}), useRouter: () => ({ navigate: jest.fn(), setParams: jest.fn() }) }));
jest.mock('@/viewmodels/useAnaliseViewModel', () => ({ useAnaliseViewModel: jest.fn() }));
jest.mock('@/viewmodels/useSpendingAlertsViewModel', () => ({ useSpendingAlertsViewModel: () => ({ alert: null, refreshing: false, refresh: jest.fn() }) }));
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
const base = { categoryExpenses: [], categoryTotal: 'R$ 0,00', movements: [], periodKey: '30D', periodLabel: '30 dias', refreshing: false, retry: jest.fn(), refresh: jest.fn(), setPeriodKey: jest.fn(), setSortOrder: jest.fn(), setTypeFilter: jest.fn(), sortOrder: 'NEWEST', typeFilter: 'ALL' };

test('apresenta erro e encaminha nova tentativa', async () => {
  const retry = jest.fn();
  jest.mocked(useAnaliseViewModel).mockReturnValue({ ...base, status: 'error', retry } as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><AnaliseScreen /></SafeAreaProvider>);
  expect(screen.getByText('Não foi possível carregar sua análise.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Tentar novamente'));
  expect(retry).toHaveBeenCalledTimes(1);
});

test('abre e fecha lista completa de transações', async () => {
  jest.mocked(useAnaliseViewModel).mockReturnValue({ ...base, status: 'success' } as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><AnaliseScreen /></SafeAreaProvider>);
  await fireEvent.press(screen.getByLabelText('Ver todas as transações'));
  expect(screen.getByLabelText('Fechar transações')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Fechar transações'));
  expect(screen.queryByLabelText('Fechar transações')).toBeNull();
});
