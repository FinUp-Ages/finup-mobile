import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import {
  getStudyProgressMock,
  resetStudyProgressMock,
  submitStudyAnswersMock,
} from './studyProgressMock';
import { getStudyQuestionsMock, studyCategoriesMock } from './studyTrackMock';
import { buildStudyLevels } from '../utils/studyTrack';

const rendaFixa = studyCategoriesMock[0];
const poupanca = studyCategoriesMock[2];
const questions = getStudyQuestionsMock(rendaFixa.id);
const progressOf = (categoryId: string) =>
  getStudyProgressMock().categories.find((item) => item.categoryId === categoryId)!;

beforeEach(resetStudyProgressMock);

test('demonstração começa no nível 3 de Renda Fixa, com nuvem nos níveis 3 a 5', () => {
  const progress = progressOf(rendaFixa.id);
  assert.equal(progress.currentLevel, 3);
  assert.equal(progress.completionPercentage, 40);
  const levels = buildStudyLevels(questions, progress);
  assert.deepEqual(
    levels.map((level) => level.reached),
    [true, true, true, false, false],
  );
  assert.deepEqual(
    levels.map((level) => level.stars),
    [0, 3, 0, 0, 0],
  );
  // Os outros cursos começam sem respostas, com o nível 1 aberto.
  assert.equal(progressOf(poupanca.id).currentLevel, 1);
});

test('POST parcial do mock avança o nível e acumula com as respostas anteriores', () => {
  const result = submitStudyAnswersMock({
    categoryId: rendaFixa.id,
    answers: [{ questionId: questions[2].id, answer: 'errado' }],
  });
  assert.equal(result.gradableCount, 2);
  assert.equal(result.correctCount, 1);
  assert.equal(result.stars, 2);
  assert.equal(result.answers.length, 3);
  const progress = progressOf(rendaFixa.id);
  assert.equal(progress.currentLevel, 4);
  assert.deepEqual(
    progress.levels.map((level) => level.stars),
    [null, 3, 1, null, null],
  );
});

test('responder de novo substitui a resposta anterior, como no back', () => {
  submitStudyAnswersMock({
    categoryId: rendaFixa.id,
    answers: [{ questionId: questions[1].id, answer: 'Um valor fixo definido pelo banco' }],
  });
  assert.equal(progressOf(rendaFixa.id).levels[1].stars, 1);
  assert.equal(progressOf(rendaFixa.id).answeredQuestions, 2);
});

test('mock recusa lote vazio, repetido ou com pergunta de outro curso, sem gravar', () => {
  const before = JSON.stringify(getStudyProgressMock());
  for (const answers of [
    [],
    [
      { questionId: questions[3].id, answer: null },
      { questionId: questions[3].id, answer: null },
    ],
    [{ questionId: getStudyQuestionsMock(poupanca.id)[0].id, answer: null }],
  ]) {
    assert.throws(() => submitStudyAnswersMock({ categoryId: rendaFixa.id, answers }));
  }
  assert.equal(JSON.stringify(getStudyProgressMock()), before);
});

test('concluir o curso deixa todos os níveis alcançados e 100% de avanço', () => {
  submitStudyAnswersMock({
    categoryId: rendaFixa.id,
    answers: questions.slice(2).map((question) => ({
      questionId: question.id,
      answer: question.published.type === 'FILL_BLANK' ? 'liquidez' : null,
    })),
  });
  const progress = progressOf(rendaFixa.id);
  assert.equal(progress.completionPercentage, 100);
  assert.equal(progress.currentLevel, 5);
  assert.ok(buildStudyLevels(questions, progress).every((level) => level.reached));
});
