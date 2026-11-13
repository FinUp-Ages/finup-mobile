import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCategoryProgress,
  buildTrackProgress,
  levelStars,
  parseStudyTrackProgress,
} from './studyProgress';

const ids = ['mc', 'fb', 'learning'];
const answers = (entries: Record<string, boolean | null>) =>
  new Map(Object.entries(entries).map(([id, correct]) => [id, { correct }]));

// Mesmos cenários de StudyTrackAnswerServiceTest no back: o mock precisa dar o mesmo resultado.
test('sem respostas: nível atual 1, nada concluído, sem estrelas', () => {
  const progress = buildCategoryProgress('c', ids, answers({}));
  assert.equal(progress.currentLevel, 1);
  assert.equal(progress.answeredQuestions, 0);
  assert.equal(progress.completionPercentage, 0);
  assert.equal(progress.percentage, 0);
  assert.equal(progress.stars, null);
  assert.deepEqual(
    progress.levels.map((level) => [level.level, level.questionId, level.completed, level.stars]),
    [
      [1, 'mc', false, null],
      [2, 'fb', false, null],
      [3, 'learning', false, null],
    ],
  );
});

test('parcial: nível atual é o primeiro pendente e cada nível tem a própria estrela', () => {
  const progress = buildCategoryProgress('c', ids, answers({ mc: false, fb: true }));
  assert.equal(progress.currentLevel, 3);
  assert.equal(progress.completionPercentage, 200 / 3);
  assert.equal(progress.percentage, 50);
  assert.equal(progress.stars, 2);
  assert.deepEqual(
    progress.levels.map((level) => level.stars),
    [1, 3, null],
  );
});

test('fora de ordem não pula o nível 1; completo e vazio seguem o C6', () => {
  assert.equal(buildCategoryProgress('c', ids, answers({ fb: true })).currentLevel, 1);
  const complete = buildCategoryProgress('c', ids, answers({ mc: true, fb: true, learning: null }));
  assert.equal(complete.currentLevel, 3);
  assert.equal(complete.completionPercentage, 100);
  assert.equal(complete.levels[2].stars, null);
  const empty = buildCategoryProgress('c', [], answers({}));
  assert.equal(empty.currentLevel, 0);
  assert.deepEqual(empty.levels, []);
  const single = buildCategoryProgress('c', ['so'], answers({ so: true }));
  assert.equal(single.currentLevel, 1);
  assert.equal(single.completionPercentage, 100);
});

test('resposta de pergunta fora da lista (despublicada) não conta', () => {
  const progress = buildCategoryProgress('c', ['fb'], answers({ mc: false, fb: true }));
  assert.equal(progress.answeredQuestions, 1);
  assert.equal(progress.stars, 3);
});

test('total soma as categorias; estrela de nível é 3 no acerto e 1 no erro', () => {
  const total = buildTrackProgress([
    buildCategoryProgress('a', ids, answers({ mc: true })),
    buildCategoryProgress('b', ['x'], answers({ x: false })),
  ]).total;
  assert.equal(total.totalQuestions, 4);
  assert.equal(total.answeredQuestions, 2);
  assert.equal(total.percentage, 50);
  assert.equal(total.completionPercentage, 50);
  assert.equal(total.stars, 2);
  assert.deepEqual([levelStars(true), levelStars(false), levelStars(null)], [3, 1, null]);
});

test('lê o progresso do back com nulos explícitos ou omitidos', () => {
  const sample = {
    categories: [
      {
        categoryId: 'c',
        totalQuestions: 2,
        answeredQuestions: 1,
        correctAnswers: 1,
        gradableQuestions: 1,
        stars: 3,
        percentage: 100,
        completionPercentage: 50,
        currentLevel: 2,
        levels: [
          { level: 1, questionId: 'q1', completed: true, correct: true, stars: 3 },
          { level: 2, questionId: 'q2', completed: false, correct: null, stars: null },
        ],
      },
      {
        categoryId: 'vazia',
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        gradableQuestions: 0,
        percentage: 0,
        completionPercentage: 0,
        currentLevel: 0,
        levels: [],
      },
    ],
    total: {
      totalQuestions: 2,
      answeredQuestions: 1,
      correctAnswers: 1,
      gradableQuestions: 1,
      stars: 3,
      percentage: 100,
      completionPercentage: 50,
    },
  };
  const parsed = parseStudyTrackProgress(JSON.parse(JSON.stringify(sample)));
  assert.equal(parsed.categories[0].levels[1].correct, null);
  assert.equal(parsed.categories[0].levels[1].stars, null);
  assert.equal(parsed.categories[1].stars, null);
  // Mesmo nível sem os campos nulos (serialização non_null).
  const omitted = structuredClone(sample);
  omitted.categories[0].levels[1] = { level: 2, questionId: 'q2', completed: false } as never;
  assert.equal(parseStudyTrackProgress(omitted).categories[0].levels[1].stars, null);
});

test('formato inesperado é recusado, para a trilha cair no modo sem bloqueio', () => {
  for (const invalid of [
    null,
    {},
    { categories: [{ categoryId: 'c' }] },
    { categories: [{ categoryId: 'c', completionPercentage: 0, currentLevel: 1, levels: [{}] }] },
    {
      categories: [
        {
          categoryId: 'c',
          completionPercentage: 0,
          currentLevel: 1,
          levels: [{ level: 1, questionId: 'q', completed: 'sim' }],
        },
      ],
    },
  ]) {
    assert.throws(() => parseStudyTrackProgress(invalid));
  }
});
