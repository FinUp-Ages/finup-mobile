/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthInitialViewModel } from '@/viewmodels/useAuthInitialViewModel';
import AuthInitialScreen from './AuthInitialScreen';
jest.mock('@/viewmodels/useAuthInitialViewModel', () => ({ useAuthInitialViewModel: jest.fn() }));
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
test('encaminha cadastro e login e apresenta erro', async () => {
  const handleCreateAccount = jest.fn(), handleAlreadyCustomer = jest.fn();
  jest.mocked(useAuthInitialViewModel).mockReturnValue({ isLoadingGoogle: false, isLoadingApple: false, isAnyLoading: false, error: 'Erro de autenticação', handleCreateAccount, handleAlreadyCustomer, handleGoogleAuth: jest.fn(), handleAppleAuth: jest.fn() });
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><AuthInitialScreen /></SafeAreaProvider>);
  expect(screen.getByText('Erro de autenticação')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Criar sua conta no FinUp'));
  await fireEvent.press(screen.getByLabelText('Ja sou cliente, entrar'));
  expect(handleCreateAccount).toHaveBeenCalledTimes(1);
  expect(handleAlreadyCustomer).toHaveBeenCalledTimes(1);
});
