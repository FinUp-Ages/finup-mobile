import type { StudyAnswersRequest, StudyAnswersResponse } from '../types/studySession';
import { gradeStudyAnswers, parseStudySessionQuestions } from '../utils/studyQuestion';
import { getStudyQuestionsMock } from './studyTrackMock';

type HttpClient = {
  post<T>(path: string, body: unknown): Promise<T>;
};

/** Usa a mesma flag da trilha. Falhas da API real nunca ativam dados de demonstração. */
export function createStudyAnswersApi(http: HttpClient, useMocks: boolean) {
  return {
    async submitAnswers(payload: StudyAnswersRequest): Promise<StudyAnswersResponse> {
      if (useMocks) {
        const questions = parseStudySessionQuestions(getStudyQuestionsMock(payload.categoryId));
        return gradeStudyAnswers(questions, payload);
      }
      return http.post<StudyAnswersResponse>('/api/v1/study-tracks/answers', payload);
    },
  };
}
