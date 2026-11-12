import assert from 'node:assert/strict';
import test from 'node:test';
import { getStudyQuestionsMock, studyCategoriesMock } from '../models/studyTrackMock';
import {
  canRespond,
  createStudySession,
  studySessionPayload,
  studySessionReducer as reduce,
  type StudySession,
} from './studySession';
import { gradeStudyAnswers, parseStudySessionQuestions } from './studyQuestion';

const categoryId = studyCategoriesMock[0].id;
const published = parseStudySessionQuestions(getStudyQuestionsMock(categoryId));
// Começar pela objetiva permite testar seleção; a leitura continua no mesmo lote.
const questions = [published[1], published[0], ...published.slice(2)];

function answerCurrent(session: StudySession): StudySession {
  const content = session.questions[session.index].published;
  if (content.type === 'LEARNING') return reduce(session, { type: 'next' });
  let next =
    content.type === 'MULTIPLE_CHOICE'
      ? reduce(session, {
          type: 'select',
          index: content.options.findIndex((option) => option.correct),
        })
      : reduce(session, { type: 'input', value: content.answers[0] });
  next = reduce(next, { type: 'respond' });
  return reduce(next, { type: 'next' });
}

test('responder exige seleção; trocar alternativa mantém somente a última selecionada', () => {
  const initial = createStudySession(questions, questions[0].id);
  assert.equal(canRespond(initial), false);
  assert.equal(reduce(initial, { type: 'respond' }), initial);
  assert.equal(reduce(initial, { type: 'next' }), initial);
  let session = reduce(initial, { type: 'select', index: 0 });
  session = reduce(session, { type: 'select', index: 1 });
  assert.equal(session.selected, 1);
  session = reduce(session, { type: 'respond' });
  assert.equal(session.phase, 'feedback');
  assert.equal(session.answers[questions[0].id].correct, true);
  assert.equal(reduce(session, { type: 'select', index: 0 }), session);
  assert.equal(reduce(session, { type: 'respond' }), session);
  assert.equal(reduce(session, { type: 'next' }).index, 1);
});

test('resposta errada recebe feedback e permite seguir; lacuna vazia não pode ser enviada', () => {
  let session = createStudySession(questions, questions[0].id);
  session = reduce(reduce(session, { type: 'select', index: 0 }), { type: 'respond' });
  assert.equal(session.answers[questions[0].id].correct, false);
  assert.equal(reduce(session, { type: 'next' }).phase, 'answering');
  const blank = reduce(createStudySession(questions, questions[2].id), {
    type: 'input',
    value: '   ',
  });
  assert.equal(canRespond(blank), false);
  assert.equal(reduce(blank, { type: 'respond' }), blank);
});

test('abrir no meio percorre todos os itens em ordem circular antes de enviar', () => {
  let session = createStudySession(questions, questions[2].id);
  assert.throws(() => studySessionPayload(session, categoryId));
  const visited: number[] = [];
  while (session.phase !== 'submitting') {
    visited.push(session.index);
    session = answerCurrent(session);
  }
  assert.deepEqual(visited, [2, 3, 4, 0, 1]);
  const payload = studySessionPayload(session, categoryId);
  assert.equal(payload.answers.length, questions.length);
  assert.deepEqual(
    payload.answers.map((item) => item.questionId),
    questions.map((item) => item.id),
  );
  assert.equal(payload.answers[1].answer, null);
  assert.deepEqual(Object.keys(payload.answers[0]).sort(), ['answer', 'questionId']);
  assert.equal(reduce(session, { type: 'next' }), session);
  assert.equal(reduce(session, { type: 'respond' }), session);
});

test('falha e retry preservam exatamente o lote, e resultado definitivo vem do servidor', () => {
  let session = createStudySession(questions, questions[0].id);
  while (session.phase !== 'submitting') session = answerCurrent(session);
  const payload = studySessionPayload(session, categoryId);
  session = reduce(session, { type: 'failed', message: 'Sem conexão' });
  assert.equal(session.phase, 'save-error');
  assert.equal(reduce(session, { type: 'next' }), session);
  session = reduce(session, { type: 'retry' });
  assert.deepEqual(studySessionPayload(session, categoryId), payload);
  const serverResult = { ...gradeStudyAnswers(questions, payload), correctCount: 0, stars: 1 };
  session = reduce(session, { type: 'saved', result: serverResult });
  assert.equal(session.phase, 'complete');
  assert.equal(session.result?.stars, 1);
  assert.equal(session.result?.correctCount, 0);
  assert.equal(reduce(session, { type: 'retry' }), session);
});

test('categoria apenas educativa conclui sem nota e categoria vazia não inicia envio', () => {
  const learning = [questions[1], questions[4]];
  let session = createStudySession(learning, learning[0].id);
  session = answerCurrent(answerCurrent(session));
  const result = gradeStudyAnswers(learning, studySessionPayload(session, categoryId));
  assert.equal(result.stars, null);
  assert.equal(result.gradableCount, 0);
  const empty = createStudySession([], 'missing');
  assert.equal(canRespond(empty), false);
  assert.equal(reduce(empty, { type: 'next' }), empty);
  assert.throws(() => studySessionPayload(empty, categoryId));
});
