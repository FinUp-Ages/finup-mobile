import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudyAnswersApi } from './studyAnswersApi';
import { resetStudyProgressMock } from './studyProgressMock';
import { getStudyQuestionsMock, studyCategoriesMock } from './studyTrackMock';
import { parseStudySessionQuestions } from '../utils/studyQuestion';
import {
  createStudySession,
  studySessionPayload,
  studySessionReducer,
} from '../utils/studySession';
import type { StudyAnswersResponse } from '../types/studySession';

test('envio real usa a rota C6 e somente categoryId, questionId e texto/null, sem nota local', async () => {
  const calls: { path: string; body: unknown }[] = [];
  const payload = {
    categoryId: 'categoria',
    answers: [
      { questionId: 'objetiva', answer: 'Texto da alternativa' },
      { questionId: 'lacuna', answer: 'liquidez' },
      { questionId: 'leitura', answer: null },
    ],
  };
  const serverResult: StudyAnswersResponse = {
    categoryId: 'categoria',
    correctCount: 1,
    gradableCount: 2,
    stars: 2,
    answers: [],
  };
  const api = createStudyAnswersApi(
    {
      async post<T>(path: string, body: unknown): Promise<T> {
        calls.push({ path, body });
        return serverResult as T;
      },
    },
    false,
  );
  assert.deepEqual(await api.submitAnswers(payload), serverResult);
  assert.deepEqual(calls, [{ path: '/api/v1/study-tracks/answers', body: payload }]);
});

test('erro da API é propagado sem sucesso simulado ou fallback para mock', async () => {
  const failure = new Error('offline');
  const api = createStudyAnswersApi(
    {
      post: async () => {
        throw failure;
      },
    },
    false,
  );
  await assert.rejects(api.submitAnswers({ categoryId: 'categoria', answers: [] }), failure);
});

test('resposta real sem stars/correct (non_null do back) vira null', async () => {
  const api = createStudyAnswersApi(
    {
      async post<T>(): Promise<T> {
        return {
          categoryId: 'categoria',
          correctCount: 0,
          gradableCount: 0,
          answers: [{ questionId: 'leitura', submittedAt: '2026-11-12T00:00:00Z' }],
        } as T;
      },
    },
    false,
  );
  const result = await api.submitAnswers({
    categoryId: 'categoria',
    answers: [{ questionId: 'leitura', answer: null }],
  });
  assert.equal(result.stars, null);
  assert.equal(result.answers[0].correct, null);
  assert.equal(result.answers[0].answer, null);
});

test('modo demonstração usa as perguntas da própria trilha e acumula a rodada', async () => {
  resetStudyProgressMock();
  const api = createStudyAnswersApi(
    {
      post: async () => {
        throw new Error('HTTP não deve ser chamado');
      },
    },
    true,
  );
  const categoryId = studyCategoriesMock[0].id;
  const questions = parseStudySessionQuestions(getStudyQuestionsMock(categoryId));
  let session = createStudySession(questions, questions[0].id);
  while (session.phase !== 'submitting') {
    const content = questions[session.index].published;
    if (content.type !== 'LEARNING') {
      session = studySessionReducer(
        session,
        content.type === 'MULTIPLE_CHOICE'
          ? { type: 'select', index: content.options.findIndex((option) => option.correct) }
          : { type: 'input', value: content.answers[0] },
      );
      session = studySessionReducer(session, { type: 'respond' });
    }
    session = studySessionReducer(session, { type: 'next' });
  }
  const result = await api.submitAnswers(studySessionPayload(session, categoryId));
  assert.equal(result.stars, 3);
  assert.equal(result.correctCount, 2);
  assert.equal(result.answers.filter((answer) => answer.correct === null).length, 3);
  await assert.rejects(api.submitAnswers({ categoryId, answers: [] }));
  resetStudyProgressMock();
});

test('todos os mocks publicados pelo colega são aceitos sem modificar a trilha', () => {
  for (const category of studyCategoriesMock) {
    const published = getStudyQuestionsMock(category.id);
    assert.equal(parseStudySessionQuestions(published), published);
  }
});
