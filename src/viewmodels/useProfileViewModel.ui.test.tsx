/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { authModel } from '@/models/authModel';
import { triageModel } from '@/models/triageModel';
import { useProfileViewModel } from './useProfileViewModel';

const mockRouter = { replace: jest.fn(), push: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  return { useRouter: () => mockRouter, useFocusEffect: (effect: () => void) => React.useEffect(effect, [effect]) };
});
jest.mock('@/models/authModel', () => ({ authModel: { signOut: jest.fn() } }));
jest.mock('@/models/triageModel', () => ({ triageModel: { getAssessment: jest.fn() } }));

beforeEach(() => jest.resetAllMocks());

test('carrega avaliação e abre triagem', async () => {
  jest.mocked(triageModel.getAssessment).mockResolvedValue({ score: 72 } as never);
  const { result } = await renderHook(() => useProfileViewModel());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.assessment).toMatchObject({ score: 72 });
  await act(async () => result.current.openTriage());
  expect(mockRouter.push).toHaveBeenCalledWith('/triage');
});

test('permite repetir carregamento após erro', async () => {
  jest.mocked(triageModel.getAssessment).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(null);
  const { result } = await renderHook(() => useProfileViewModel());
  await waitFor(() => expect(result.current.loadError).toBe(true));
  await act(async () => result.current.retry());
  expect(result.current.loadError).toBe(false);
  expect(result.current.loading).toBe(false);
});

test('logout retorna à autenticação', async () => {
  jest.mocked(triageModel.getAssessment).mockResolvedValue(null);
  jest.mocked(authModel.signOut).mockResolvedValue(undefined as never);
  const { result } = await renderHook(() => useProfileViewModel());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => result.current.signOut());
  expect(authModel.signOut).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)');
  expect(result.current.signingOut).toBe(false);
});
