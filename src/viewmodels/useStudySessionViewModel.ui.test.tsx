/// <reference types="jest" />
import { renderHook } from '@testing-library/react-native';
import { useStudySessionViewModel } from './useStudySessionViewModel';
jest.mock('@/models/studyAnswersModel', () => ({ studyAnswersModel: { submitAnswers: jest.fn() } }));
test('informa quando questão solicitada não está disponível', async () => {
  const onSaved = jest.fn();
  const { result } = await renderHook(() => useStudySessionViewModel({ categoryId: 'c', questions: [], startQuestionId: 'inexistente', onSaved }));
  expect(result.current.contentError).toContain('não está disponível');
  expect(onSaved).not.toHaveBeenCalled();
});
