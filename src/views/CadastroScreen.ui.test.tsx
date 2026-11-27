/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCadastroViewModel } from '@/viewmodels/useCadastroViewModel';
import CadastroScreen from './CadastroScreen';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}) }));
jest.mock('@/viewmodels/useCadastroViewModel', () => ({ useCadastroViewModel: jest.fn() }));
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };

test('mostra etapas de formulário e encaminha próximo e salvar', async () => {
  const goNext = jest.fn(), submit = jest.fn();
  const vm = { step: 1, phase: 'form', data: { nome: '', sobrenome: '', email: '', celular: '', birthDate: '', monthlyIncome: '', profissao: '', senha: '', confirmarSenha: '' }, errors: {}, code: '', canProceed: true, submitting: false, checkingEmail: false, resending: false, codeResent: false, submitError: null, isLastStep: false, canGoBack: false, showProgress: true, showCelularInStep2: false, setField: jest.fn(), touchField: jest.fn(), setCode: jest.fn(), goNext, goBack: jest.fn(), submit, resendCode: jest.fn(), close: jest.fn() };
  jest.mocked(useCadastroViewModel).mockReturnValue(vm as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><CadastroScreen /></SafeAreaProvider>);
  expect(screen.getByText('Preencha com seus dados legais')).toBeTruthy();
  await fireEvent.press(screen.getByText('Próximo'));
  expect(goNext).toHaveBeenCalledTimes(1);
  jest.mocked(useCadastroViewModel).mockReturnValue({ ...vm, step: 2, canGoBack: true } as never);
  await screen.rerender(<SafeAreaProvider initialMetrics={metrics}><CadastroScreen /></SafeAreaProvider>);
  expect(screen.getByText('Dados adicionais')).toBeTruthy();
  jest.mocked(useCadastroViewModel).mockReturnValue({ ...vm, step: 3, isLastStep: true } as never);
  await screen.rerender(<SafeAreaProvider initialMetrics={metrics}><CadastroScreen /></SafeAreaProvider>);
  expect(screen.getByText('Deve conter letras, números e símbolos.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Salvar'));
  expect(submit).toHaveBeenCalledTimes(1);
});

test('apresenta confirmação, erro e ação de reenvio', async () => {
  const resendCode = jest.fn(), submit = jest.fn();
  jest.mocked(useCadastroViewModel).mockReturnValue({ step: 3, phase: 'code', data: { email: 'ana@exemplo.com' }, errors: {}, code: '123456', canProceed: true, submitting: false, checkingEmail: false, resending: false, codeResent: false, submitError: 'Código inválido', isLastStep: true, canGoBack: true, showProgress: false, showCelularInStep2: false, setField: jest.fn(), touchField: jest.fn(), setCode: jest.fn(), goNext: jest.fn(), goBack: jest.fn(), submit, resendCode, close: jest.fn() } as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><CadastroScreen /></SafeAreaProvider>);
  expect(screen.getByText('Código inválido')).toBeTruthy();
  await fireEvent.press(screen.getByText('Reenviar código'));
  await fireEvent.press(screen.getByText('Confirmar'));
  expect(resendCode).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledTimes(1);
});
