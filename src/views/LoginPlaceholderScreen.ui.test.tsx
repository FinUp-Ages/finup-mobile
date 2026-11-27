/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLoginViewModel } from '@/viewmodels/useLoginViewModel';
import LoginPlaceholderScreen from './LoginPlaceholderScreen';
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@/viewmodels/useLoginViewModel', () => ({ useLoginViewModel: jest.fn() }));
test('apresenta erro e encaminha campos e envio', async () => {
  const setEmail = jest.fn(), submit = jest.fn();
  jest.mocked(useLoginViewModel).mockReturnValue({ email: '', password: '', emailError: undefined, error: 'Falha no login', canSubmit: true, submitting: false, setEmail, setPassword: jest.fn(), touchEmail: jest.fn(), submit });
  const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><LoginPlaceholderScreen /></SafeAreaProvider>);
  expect(screen.getByText('Falha no login')).toBeTruthy();
  await fireEvent.changeText(screen.getByPlaceholderText('E-mail'), 'ana@teste.com');
  await fireEvent.press(screen.getAllByText('Entrar')[1]);
  expect(setEmail).toHaveBeenCalledWith('ana@teste.com');
  expect(submit).toHaveBeenCalledTimes(1);
});
