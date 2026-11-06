import { httpClient } from '@/config/httpClient';
import { getStudyQuestionsMock, studyCategoriesMock } from '@/models/studyTrackMock';
import type { StudyCategory, StudyQuestion } from '@/types/studyTrack';

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
};
