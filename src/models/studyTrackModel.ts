import { httpClient } from '@/config/httpClient';
import { getStudyProgressMock } from '@/models/studyProgressMock';
import { getStudyQuestionsMock, studyCategoriesMock } from '@/models/studyTrackMock';
import type { StudyCategory, StudyQuestion, StudyTrackProgress } from '@/types/studyTrack';
import { parseStudyTrackProgress } from '@/utils/studyProgress';

export const studyTrackUsesMocks = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
const path = '/api/v1/study-tracks/categories';

export const studyTrackModel = {
  async categories(): Promise<StudyCategory[]> {
    return studyTrackUsesMocks ? studyCategoriesMock : httpClient.get<StudyCategory[]>(path);
  },
  async questions(categoryId: string): Promise<StudyQuestion[]> {
    return studyTrackUsesMocks
      ? getStudyQuestionsMock(categoryId)
      : httpClient.get<StudyQuestion[]>(`${path}/${encodeURIComponent(categoryId)}/questions`);
  },
  /** GET /study-tracks/progress (C6): níveis alcançados e estrelas de cada nível. */
  async progress(): Promise<StudyTrackProgress> {
    return parseStudyTrackProgress(
      studyTrackUsesMocks
        ? getStudyProgressMock()
        : await httpClient.get<unknown>('/api/v1/study-tracks/progress'),
    );
  },
};
