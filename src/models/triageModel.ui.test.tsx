/// <reference types="jest" />
import { HttpError, httpClient } from '@/config/httpClient';
import { triageModel } from './triageModel';
jest.mock('@/config/httpClient', () => ({
  HttpError: class extends Error { constructor(code: number, message: string) { super(message); Object.assign(this, { status: code }); } },
  httpClient: { get: jest.fn(), post: jest.fn() },
}));
beforeEach(() => jest.resetAllMocks());
test('retorna null para resultado ausente e propaga outros erros', async () => {
  jest.mocked(httpClient.get).mockRejectedValueOnce(new HttpError(404, 'ausente')).mockRejectedValueOnce(new HttpError(500, 'erro'));
  await expect(triageModel.getAssessment()).resolves.toBeNull();
  await expect(triageModel.getAnswers()).rejects.toThrow('erro');
});
test('envia versão e respostas juntas', async () => {
  await triageModel.submit(2, { q: false });
  expect(httpClient.post).toHaveBeenCalledWith('/api/v1/triage/answers', { version: 2, answers: { q: false } });
});
