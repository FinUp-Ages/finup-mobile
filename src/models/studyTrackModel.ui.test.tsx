/// <reference types="jest" />
import { httpClient } from '@/config/httpClient';
import { studyTrackModel, studyTrackUsesMocks } from './studyTrackModel';
jest.mock('@/config/httpClient', () => ({ httpClient: { get: jest.fn() } }));
test('solicita questões da categoria com id codificado quando usa serviço', async () => {
  if (studyTrackUsesMocks) {
    await expect(studyTrackModel.categories()).resolves.toBeInstanceOf(Array);
  } else {
    jest.mocked(httpClient.get).mockResolvedValueOnce([]);
    await expect(studyTrackModel.questions('a/b')).resolves.toEqual([]);
    expect(httpClient.get).toHaveBeenCalledWith('/api/v1/study-tracks/categories/a%2Fb/questions');
  }
});
