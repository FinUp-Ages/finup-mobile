import type { StudyAnswersRequest, StudyAnswersResponse } from '../types/studySession';
import { submitStudyAnswersMock } from './studyProgressMock';

type HttpClient = {
  post<T>(path: string, body: unknown): Promise<T>;
};

/**
 * O back serializa com `non_null`: `stars` e `correct` sem nota chegam ausentes, não `null`. O
 * app trata os dois do mesmo jeito.
 */
function withNulls(result: StudyAnswersResponse): StudyAnswersResponse {
  return {
    ...result,
    stars: result.stars ?? null,
    answers: (result.answers ?? []).map((answer) => ({
      ...answer,
      answer: answer.answer ?? null,
      correct: answer.correct ?? null,
    })),
  };
}

/**
 * Usa a mesma flag da trilha. Aceita uma ou mais perguntas da categoria (C6). Falhas da API real
 * nunca ativam dados de demonstração.
 */
export function createStudyAnswersApi(http: HttpClient, useMocks: boolean) {
  return {
    async submitAnswers(payload: StudyAnswersRequest): Promise<StudyAnswersResponse> {
      if (useMocks) return submitStudyAnswersMock(payload);
      return withNulls(
        await http.post<StudyAnswersResponse>('/api/v1/study-tracks/answers', payload),
      );
    },
  };
}
