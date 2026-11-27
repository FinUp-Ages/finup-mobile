/// <reference types="jest" />
import { act, renderHook } from '@testing-library/react-native';
import { HttpError } from '@/config/httpClient';
import { authModel } from '@/models/authModel';
import { userModel } from '@/models/userModel';
import { widgetLaunchModel } from '@/models/widgetLaunchModel';
import { useCadastroViewModel } from './useCadastroViewModel';

const mockRouter = { back: jest.fn(), replace: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('@/models/authModel', () => ({
  authModel: { generateUsername: jest.fn(), signUp: jest.fn(), confirmSignUp: jest.fn(), signIn: jest.fn(), resendCode: jest.fn(), hasSession: jest.fn(), signOut: jest.fn() },
  authErrorMessage: (_error: unknown, operation: string) => `Erro: ${operation}`,
}));
jest.mock('@/models/userModel', () => ({ userModel: { isEmailAvailable: jest.fn(), ensureCreated: jest.fn(), updateAdditionalInfo: jest.fn() } }));
jest.mock('@/models/widgetLaunchModel', () => ({ widgetLaunchModel: { discardPending: jest.fn() } }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(authModel.generateUsername).mockReturnValue('uuid');
  jest.mocked(userModel.isEmailAvailable).mockResolvedValue(true);
});

async function fillFirst(result: { current: ReturnType<typeof useCadastroViewModel> }) {
  await act(async () => {
    result.current.setField('nome', 'Ana');
    result.current.setField('sobrenome', 'Silva');
    result.current.setField('email', 'ana@exemplo.com');
    result.current.setField('celular', '11999998888');
  });
}

async function reachPassword(result: { current: ReturnType<typeof useCadastroViewModel> }) {
  await fillFirst(result);
  await act(async () => result.current.goNext());
  await act(async () => result.current.setField('birthDate', '2000-01-02'));
  await act(async () => result.current.goNext());
  await act(async () => {
    result.current.setField('senha', 'Senha123!');
    result.current.setField('confirmarSenha', 'Senha123!');
  });
}

test('valida campos tocados, verifica email e preserva dados ao voltar', async () => {
  const { result } = await renderHook(() => useCadastroViewModel());
  expect(widgetLaunchModel.discardPending).toHaveBeenCalled();
  expect(result.current.canProceed).toBe(false);
  await act(async () => result.current.touchField('nome'));
  expect(result.current.errors.nome).toBe(true);
  await fillFirst(result);
  expect(result.current.canProceed).toBe(true);
  await act(async () => result.current.goNext());
  expect(userModel.isEmailAvailable).toHaveBeenCalledWith('ana@exemplo.com');
  expect(result.current.step).toBe(2);
  expect(result.current.canProceed).toBe(false);
  await act(async () => result.current.goBack());
  expect(result.current.data.nome).toBe('Ana');
  await act(async () => result.current.goNext());
  expect(userModel.isEmailAvailable).toHaveBeenCalledTimes(1);
});

test('impede avanço com email cadastrado e libera após alteração', async () => {
  jest.mocked(userModel.isEmailAvailable).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const { result } = await renderHook(() => useCadastroViewModel());
  await fillFirst(result);
  await act(async () => result.current.goNext());
  expect(result.current.step).toBe(1);
  expect(result.current.errors.email).toBe('Este e-mail já está cadastrado.');
  await act(async () => result.current.setField('email', 'novo@exemplo.com'));
  await act(async () => result.current.goNext());
  expect(result.current.step).toBe(2);
});

test('conclui cadastro após confirmação e limpa senha', async () => {
  const { result } = await renderHook(() => useCadastroViewModel());
  await reachPassword(result);
  expect(result.current.step).toBe(3);
  await act(async () => result.current.submit());
  expect(authModel.signUp).toHaveBeenCalledWith(expect.objectContaining({ username: 'uuid', email: 'ana@exemplo.com' }));
  expect(result.current.phase).toBe('code');
  await act(async () => result.current.setCode('12a34567'));
  expect(result.current.code).toBe('123456');
  await act(async () => result.current.resendCode());
  expect(authModel.resendCode).toHaveBeenCalledWith('uuid');
  expect(result.current.codeResent).toBe(true);
  await act(async () => result.current.submit());
  expect(authModel.confirmSignUp).toHaveBeenCalledWith('uuid', '123456');
  expect(authModel.signIn).toHaveBeenCalledWith('uuid', 'Senha123!');
  expect(userModel.ensureCreated).toHaveBeenCalledTimes(1);
  expect(userModel.updateAdditionalInfo).toHaveBeenCalledWith(expect.objectContaining({ birthDate: '2000-01-02', phone: '+5511999998888' }));
  expect(result.current.data.senha).toBe('');
  expect(mockRouter.replace).toHaveBeenCalledWith('/carteira');
});

test('mantém etapa após erro de cadastro e valida senha', async () => {
  const { result } = await renderHook(() => useCadastroViewModel());
  await reachPassword(result);
  await act(async () => { result.current.setField('confirmarSenha', 'outra'); result.current.touchField('confirmarSenha'); });
  expect(result.current.canProceed).toBe(false);
  expect(result.current.errors.confirmarSenha).toBe('As senhas não coincidem.');
  await act(async () => result.current.setField('confirmarSenha', 'Senha123!'));
  jest.mocked(authModel.signUp).mockRejectedValueOnce(new Error('erro'));
  await act(async () => result.current.submit());
  expect(result.current.phase).toBe('form');
  expect(result.current.submitError).toBe('Erro: signUp');
});

test('erro ao finalizar permite retry sem repetir login ou confirmação', async () => {
  const { result } = await renderHook(() => useCadastroViewModel());
  await reachPassword(result);
  await act(async () => result.current.submit());
  await act(async () => result.current.setCode('123456'));
  jest.mocked(userModel.ensureCreated).mockRejectedValueOnce(new HttpError(400, 'inválido'));
  await act(async () => result.current.submit());
  expect(result.current.phase).toBe('finishing');
  expect(result.current.submitError).toContain('dado adicional é inválido');
  await act(async () => result.current.submit());
  expect(authModel.confirmSignUp).toHaveBeenCalledTimes(1);
  expect(authModel.signIn).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace).toHaveBeenCalledWith('/carteira');
});

test('retoma cadastro com sessão e pede celular na segunda etapa', async () => {
  jest.mocked(authModel.hasSession).mockResolvedValue(true);
  const { result } = await renderHook(() => useCadastroViewModel({ resume: true }));
  expect(result.current.step).toBe(2);
  expect(result.current.showCelularInStep2).toBe(true);
  await act(async () => { result.current.setField('celular', '11999998888'); result.current.setField('birthDate', '2000-01-02'); });
  await act(async () => result.current.submit());
  expect(authModel.signUp).not.toHaveBeenCalled();
  expect(userModel.ensureCreated).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace).toHaveBeenCalledWith('/carteira');
});

test('permanece na confirmação quando código ou reenvio falham', async () => {
  const { result } = await renderHook(() => useCadastroViewModel());
  await reachPassword(result);
  await act(async () => result.current.submit());
  await act(async () => result.current.setCode('123456'));
  jest.mocked(authModel.confirmSignUp).mockRejectedValueOnce(new Error('código'));
  await act(async () => result.current.submit());
  expect(result.current.phase).toBe('code');
  expect(result.current.submitError).toBe('Erro: confirmSignUp');
  expect(authModel.signIn).not.toHaveBeenCalled();
  jest.mocked(authModel.resendCode).mockRejectedValueOnce(new Error('rede'));
  await act(async () => result.current.resendCode());
  expect(result.current.submitError).toBe('Erro: resendCode');
  expect(result.current.resending).toBe(false);
  await act(async () => result.current.goBack());
  expect(result.current.phase).toBe('form');
  expect(result.current.code).toBe('');
});

test('sem sessão ao retomar não cria usuário; fechar encerra sessão', async () => {
  jest.mocked(authModel.hasSession).mockResolvedValue(false);
  const { result } = await renderHook(() => useCadastroViewModel({ resume: true }));
  await act(async () => { result.current.setField('celular', '11999998888'); result.current.setField('birthDate', '2000-01-02'); });
  await act(async () => result.current.submit());
  expect(userModel.ensureCreated).not.toHaveBeenCalled();
  expect(result.current.submitError).toBe('Erro: signIn');
  await act(async () => result.current.close());
  expect(authModel.signOut).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)');
});
