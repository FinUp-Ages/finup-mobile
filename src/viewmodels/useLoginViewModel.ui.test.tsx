/// <reference types="jest" />

import { act, renderHook } from '@testing-library/react-native';
import { authModel } from '@/models/authModel';
import { userModel } from '@/models/userModel';
import { widgetLaunchModel } from '@/models/widgetLaunchModel';
import { useLoginViewModel } from './useLoginViewModel';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@/models/authModel', () => ({
  authModel: { signIn: jest.fn() },
  authErrorMessage: () => 'Falha no login',
}));
jest.mock('@/models/userModel', () => ({ userModel: { getMe: jest.fn() } }));
jest.mock('@/models/widgetLaunchModel', () => ({
  widgetLaunchModel: { consumePending: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

test('valida o email antes de permitir envio', async () => {
  const { result } = await renderHook(() => useLoginViewModel());
  await act(async () => {
    result.current.setEmail('invalido');
    result.current.setPassword('senha');
    result.current.touchEmail();
  });
  expect(result.current.canSubmit).toBe(false);
  expect(result.current.emailError).toBe('Deve ser um e-mail válido.');
  await act(async () => result.current.submit());
  expect(authModel.signIn).not.toHaveBeenCalled();
});

test('autentica com email normalizado e abre a carteira', async () => {
  jest.mocked(authModel.signIn).mockResolvedValueOnce(undefined as never);
  jest.mocked(userModel.getMe).mockResolvedValueOnce({} as never);
  jest.mocked(widgetLaunchModel.consumePending).mockReturnValueOnce(null);
  const { result } = await renderHook(() => useLoginViewModel());
  await act(async () => {
    result.current.setEmail(' Pessoa@Exemplo.com ');
    result.current.setPassword('senha');
  });
  await act(async () => result.current.submit());
  expect(authModel.signIn).toHaveBeenCalledWith('pessoa@exemplo.com', 'senha');
  expect(mockReplace).toHaveBeenCalledWith('/carteira');
  expect(result.current.password).toBe('');
});

test('apresenta erro de autenticação sem buscar o usuário', async () => {
  jest.mocked(authModel.signIn).mockRejectedValueOnce(new Error('falha'));
  const { result } = await renderHook(() => useLoginViewModel());
  await act(async () => {
    result.current.setEmail('pessoa@exemplo.com');
    result.current.setPassword('senha');
  });
  await act(async () => result.current.submit());
  expect(result.current.error).toBe('Falha no login');
  expect(result.current.submitting).toBe(false);
  expect(userModel.getMe).not.toHaveBeenCalled();
});
