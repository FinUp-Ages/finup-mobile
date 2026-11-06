import { httpClient, HttpError } from '@/config/httpClient';
import type { Answers, AssessmentResponse, Questionnaire, SavedAnswers } from '@/types/triage';

async function latest<T>(path: string): Promise<T | null> {
  try {
    return await httpClient.get<T>(path);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}

export const triageModel = {
  getQuestions: () => httpClient.get<Questionnaire>('/api/v1/triage/questions'),
  getAssessment: () => latest<AssessmentResponse>('/api/v1/triage/assessment'),
  getAnswers: () => latest<SavedAnswers>('/api/v1/triage/answers'),
  submit: (version: number, answers: Answers) =>
    httpClient.post<AssessmentResponse>('/api/v1/triage/answers', { version, answers }),
};
