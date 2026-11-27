/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { studyTrackModel } from '@/models/studyTrackModel';
import { useStudyTrackViewModel } from './useStudyTrackViewModel';

jest.mock('@/models/studyTrackModel', () => ({
  studyTrackUsesMocks: false,
  studyTrackModel: { categories: jest.fn(), questions: jest.fn(), progress: jest.fn() },
}));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(studyTrackModel.categories).mockResolvedValue([{ id: 'a', name: 'Finanças' }] as never);
  jest.mocked(studyTrackModel.questions).mockResolvedValue([]);
  jest.mocked(studyTrackModel.progress).mockResolvedValue({ categories: [] } as never);
});

test('carrega categoria inicial e suas questões', async () => {
  const { result } = await renderHook(() => useStudyTrackViewModel());
  await waitFor(() => expect(result.current.questionStatus).toBe('success'));
  expect(result.current.status).toBe('success');
  expect(result.current.categoryId).toBe('a');
  expect(studyTrackModel.questions).toHaveBeenCalledWith('a');
  expect(result.current.topic).toBe('Finanças');
});

test('permite tentar novamente após erro ao carregar categorias', async () => {
  jest.mocked(studyTrackModel.categories).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useStudyTrackViewModel());
  await waitFor(() => expect(result.current.status).toBe('error'));
  await act(async () => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(studyTrackModel.categories).toHaveBeenCalledTimes(2);
});

test('falha no progresso não impede a trilha de carregar', async () => {
  jest.mocked(studyTrackModel.progress).mockRejectedValueOnce(new Error('offline'));
  const { result } = await renderHook(() => useStudyTrackViewModel());
  await waitFor(() => expect(result.current.progressUnavailable).toBe(true));
  await waitFor(() => expect(result.current.questionStatus).toBe('success'));
  expect(result.current.progress).toBeNull();
});
