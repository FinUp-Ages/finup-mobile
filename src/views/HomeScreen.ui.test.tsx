/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './HomeScreen';

const mockNavigate = jest.fn(), mockFilter = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ navigate: mockNavigate, push: jest.fn() }),
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
  };
});
jest.mock('@/viewmodels/useHomeViewModel', () => ({ useHomeViewModel: () => ({ status: 'success', userName: 'Ana', score: '80', hasScore: true, balance: 'R$ 100', income: 'R$ 10', expense: 'R$ 5', expenses: [], periodKey: '30D', periodLabel: '30 dias', setPeriodKey: jest.fn(), typeFilter: 'ALL', setTypeFilter: mockFilter, refreshing: false, retry: jest.fn(), refresh: jest.fn() }) }));
jest.mock('@/viewmodels/useHomeBannerViewModel', () => ({ useHomeBannerViewModel: () => ({ triage: 'completed' }) }));
jest.mock('@/viewmodels/useSpendingAlertPopupViewModel', () => ({ useSpendingAlertPopupViewModel: () => ({ alert: null, visible: false, dismiss: jest.fn() }) }));

test('apresenta conta e encaminha navegação e filtro', async () => {
  const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><HomeScreen /></SafeAreaProvider>);
  expect(screen.getByText('Olá, Ana!')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Abrir perfil'));
  await fireEvent.press(screen.getByLabelText('Filtrar por Saída'));
  expect(mockNavigate).toHaveBeenCalledWith('/profile');
  expect(mockFilter).toHaveBeenCalledWith('EXPENSE');
});
