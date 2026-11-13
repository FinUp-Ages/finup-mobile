import assert from 'node:assert/strict';
import test from 'node:test';
import { getStudyQuestionsMock, studyCategoriesMock } from '../models/studyTrackMock';
import {
  completionPercentage,
  gradeStudyAnswers,
  gradeStudySessionQuestion,
  parseStudySessionQuestions,
  questionTitle,
  studyStars,
} from './studyQuestion';

const categoryId = studyCategoriesMock[0].id;
const published = parseStudySessionQuestions(getStudyQuestionsMock(categoryId));
// Começar pela objetiva permite testar seleção; a leitura continua no mesmo lote.
const questions = [published[1], published[0], ...published.slice(2)];

test('leitura usa o envelope integrado, tipo interno e não depende de metadados administrativos', () => {
  assert.equal(parseStudySessionQuestions(questions), questions);
  assert.equal(questions[0].published.type, 'MULTIPLE_CHOICE');
  assert.equal(Object.hasOwn(questions[0], 'type'), false);
  assert.equal(Object.hasOwn(questions[0], 'publishedAt'), false);
  assert.equal(questionTitle(questions[0], 'Renda Fixa'), 'Renda Fixa');
});

test('dados inválidos não desaparecem silenciosamente de um lote completo', () => {
  for (const value of [
    null,
    {},
    [{ id: 'draft', draft: {} }],
    [...questions, questions[0]],
    [{ id: 'q1', published: { type: 'UNKNOWN' } }],
    [
      {
        id: 'q1',
        published: {
          type: 'MULTIPLE_CHOICE',
          statement: 'Qual?',
          options: [{ text: 'A', correct: false }],
        },
      },
    ],
    [
      {
        id: 'q1',
        published: { type: 'FILL_BLANK', title: 'Lacuna', statement: '___', answers: [] },
      },
    ],
  ])
    assert.throws(() => parseStudySessionQuestions(value));
  assert.deepEqual(parseStudySessionQuestions([]), []);
});

test('correção segue o backend: texto da alternativa, caixa e espaços externos', () => {
  assert.equal(
    gradeStudySessionQuestion(questions[0], '  O VALOR INVESTIDO E OS JUROS JÁ GANHOS  '),
    true,
  );
  assert.equal(gradeStudySessionQuestion(questions[0], 'B'), false);
  assert.equal(
    gradeStudySessionQuestion(questions[0], 'Só o valor que você investiu no começo'),
    false,
  );
  assert.equal(gradeStudySessionQuestion(questions[2], ' LIQUIDEZ DIÁRIA '), true);
  assert.equal(gradeStudySessionQuestion(questions[2], 'liquidez diaria'), false);
  assert.equal(gradeStudySessionQuestion(questions[1], null), null);
});

test('mais de uma alternativa correta é aceita pelo C6, mantendo uma seleção no app', () => {
  assert.equal(
    gradeStudySessionQuestion(
      {
        id: 'q',
        published: {
          type: 'MULTIPLE_CHOICE',
          statement: 'Qual?',
          options: [
            { text: 'A', correct: true },
            { text: 'B', correct: true },
          ],
        },
      },
      'B',
    ),
    true,
  );
});

test('estrelas respeitam limites de 50 e 80 por cento e excluem conteúdo sem nota', () => {
  assert.equal(studyStars(0, 0), null);
  assert.equal(studyStars(0, 5), 1);
  assert.equal(studyStars(1, 2), 2);
  assert.equal(studyStars(79, 100), 2);
  assert.equal(studyStars(4, 5), 3);
});

test('lote inclui leituras sem nota e rejeita itens ausentes, extras ou repetidos', () => {
  const answers = questions.map((question) => ({ questionId: question.id, answer: null }));
  const result = gradeStudyAnswers(questions, { categoryId, answers });
  assert.equal(result.gradableCount, 2);
  assert.equal(result.answers[1].correct, null);
  for (const invalid of [
    answers.slice(1),
    [...answers, answers[0]],
    [...answers.slice(1), { questionId: 'extra', answer: null }],
  ]) {
    assert.throws(() => gradeStudyAnswers(questions, { categoryId, answers: invalid }));
  }
});

test('andamento da rodada inclui todos os itens respondidos mesmo com erros', () => {
  const saved = gradeStudyAnswers(questions, {
    categoryId,
    answers: questions.map((question) => ({ questionId: question.id, answer: null })),
  });
  // Terminar todas as questões com erros ainda representa 100% de conclusão, não de acertos.
  assert.equal(completionPercentage(saved.answers.length, questions.length), 100);
  assert.equal(completionPercentage(0, 0), 0);
  assert.equal(completionPercentage(6, 5), 100);
});
