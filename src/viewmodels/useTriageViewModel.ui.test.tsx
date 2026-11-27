/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { triageModel } from '@/models/triageModel';
import { userModel } from '@/models/userModel';
import { useTriageViewModel } from './useTriageViewModel';

const mockRouter = { back: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('@/models/triageModel', () => ({ triageModel: { getQuestions: jest.fn(), getAnswers: jest.fn(), getAssessment: jest.fn(), submit: jest.fn() } }));
jest.mock('@/models/userModel', () => ({ userModel: { getMe: jest.fn() } }));

const questionnaire = { version: 1, questions: [{ id: 'q', text: 'Possui reserva?', type: 'BOOLEAN', required: true, options: null, min: null, max: null, decimals: null, requiredWhen: null }] };
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(triageModel.getQuestions).mockResolvedValue(questionnaire as never);
  jest.mocked(triageModel.getAnswers).mockResolvedValue(null);
  jest.mocked(triageModel.getAssessment).mockResolvedValue(null);
  jest.mocked(userModel.getMe).mockResolvedValue({ monthlyIncome: null } as never);
});

test('valida resposta obrigatória e envia triagem respondida', async () => {
  jest.mocked(triageModel.submit).mockResolvedValue({ assessment: { profile: 'MODERATE' } } as never);
  const { result } = await renderHook(() => useTriageViewModel());
  await waitFor(() => expect(result.current.status).toBe('form'));
  await act(async () => result.current.next());
  expect(result.current.errors.q).toBe('Responda esta pergunta para continuar.');
  await act(async () => result.current.setAnswer(true));
  await act(async () => result.current.next());
  expect(triageModel.submit).toHaveBeenCalledWith(1, { q: true });
  expect(result.current.status).toBe('assessment');
});

test('mostra erro e permite carregar novamente', async () => {
  jest.mocked(triageModel.getQuestions).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useTriageViewModel());
  await waitFor(() => expect(result.current.status).toBe('error'));
  await act(async () => result.current.load());
  await waitFor(() => expect(result.current.status).toBe('form'));
  expect(result.current.current?.id).toBe('q');
});

test('mostra mensagem quando envio falha e mantém respostas', async () => {
  jest.mocked(triageModel.submit).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useTriageViewModel());
  await waitFor(() => expect(result.current.status).toBe('form'));
  await act(async () => result.current.setAnswer(false));
  await act(async () => result.current.next());
  expect(result.current.notice).toContain('Não foi possível salvar');
  expect(result.current.answers.q).toBe(false);
  expect(result.current.submitting).toBe(false);
});
