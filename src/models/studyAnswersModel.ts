import { httpClient } from '@/config/httpClient';
import { createStudyAnswersApi } from './studyAnswersApi';
import { studyTrackUsesMocks } from './studyTrackModel';

export const studyAnswersModel = createStudyAnswersApi(httpClient, studyTrackUsesMocks);
