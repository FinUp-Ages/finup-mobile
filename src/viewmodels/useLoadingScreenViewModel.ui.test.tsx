/// <reference types="jest" />
import { renderHook, waitFor } from '@testing-library/react-native';
import { authModel } from '@/models/authModel';
import { userModel } from '@/models/userModel';
import { widgetLaunchModel } from '@/models/widgetLaunchModel';
import { useLoadingScreenViewModel } from './useLoadingScreenViewModel';

const mockReplace = jest.fn();
const mockRouter = { replace: mockReplace };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('@/models/authModel', () => ({ authModel: { hasSession: jest.fn(), refreshSession: jest.fn() } }));
jest.mock('@/models/userModel', () => ({ userModel: { getMe: jest.fn() } }));
jest.mock('@/models/widgetLaunchModel', () => ({ widgetLaunchModel: { consumePending: jest.fn() } }));

beforeEach(() => jest.resetAllMocks());

test('sem sessão abre a autenticação sem consultar o usuário', async () => {
  jest.mocked(authModel.hasSession).mockResolvedValueOnce(false);
  await renderHook(() => useLoadingScreenViewModel());
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)'));
  expect(userModel.getMe).not.toHaveBeenCalled();
});

test('sessão válida abre o destino pendente do widget', async () => {
  jest.mocked(authModel.hasSession).mockResolvedValueOnce(true);
  jest.mocked(authModel.refreshSession).mockResolvedValueOnce(undefined as never);
  jest.mocked(userModel.getMe).mockResolvedValueOnce({} as never);
  jest.mocked(widgetLaunchModel.consumePending).mockReturnValueOnce('/carteira' as never);
  await renderHook(() => useLoadingScreenViewModel());
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/carteira'));
  expect(authModel.refreshSession).toHaveBeenCalledTimes(1);
});

test('falha ao renovar sessão retorna à autenticação', async () => {
  jest.mocked(authModel.hasSession).mockResolvedValueOnce(true);
  jest.mocked(authModel.refreshSession).mockRejectedValueOnce(new Error('expirada'));
  await renderHook(() => useLoadingScreenViewModel());
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)'));
  expect(userModel.getMe).not.toHaveBeenCalled();
});
