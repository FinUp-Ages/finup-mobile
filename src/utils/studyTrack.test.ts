import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCategoryProgress } from './studyProgress';
import { buildStudyLevels, learningContent, questionHeading } from './studyTrack';
import type { StudyQuestion } from '../types/studyTrack';

const questions: StudyQuestion[] = [
  {
    id: 'q1',
    published: {
      type: 'FILL_BLANK',
      textWithBlanks: 'Prefira alta {liquidez} e baixo {risco}.',
      blanks: [],
      explanation: '',
    },
  },
];

test('abrir lacunas nao revela respostas embutidas no contrato', () => {
  assert.equal(questionHeading(questions[0]), 'Prefira alta _____ e baixo _____.');
});

const list: StudyQuestion[] = ['q1', 'q2', 'q3', 'q4', 'q5'].map((id) => ({
  ...questions[0],
  id,
}));

/** Progresso no formato do C6 a partir das mesmas regras do back (usadas pelo mock). */
function progressFor(answers: Record<string, boolean | null>, ids = list.map((q) => q.id)) {
  return buildCategoryProgress(
    'categoria',
    ids,
    new Map(Object.entries(answers).map(([id, correct]) => [id, { correct }])),
  );
}

test('sem progresso (erro ou carregando), nada é bloqueado nem ganha estrela', () => {
  const levels = buildStudyLevels(list, null);
  assert.ok(levels.every((level) => level.stars === 0 && level.reached));
  assert.deepEqual(
    levels.map((level) => level.number),
    [1, 2, 3, 4, 5],
  );
  assert.deepEqual(buildStudyLevels([], null), []);
});

test('usuário sem respostas tem só o nível 1 alcançado', () => {
  const levels = buildStudyLevels(list, progressFor({}));
  assert.deepEqual(
    levels.map((level) => level.reached),
    [true, false, false, false, false],
  );
  assert.ok(levels.every((level) => level.stars === 0));
});

test('resposta parcial: alcança até o primeiro nível pendente, com estrelas por nível', () => {
  // Nível 1 lido (sem nota), nível 2 certo, nível 3 errado: o atual é o 4, com nuvem no 5.
  const levels = buildStudyLevels(list, progressFor({ q1: null, q2: true, q3: false }));
  assert.deepEqual(
    levels.map((level) => level.reached),
    [true, true, true, true, false],
  );
  assert.deepEqual(
    levels.map((level) => level.stars),
    [0, 3, 1, 0, 0],
  );
});

test('nível respondido fora de ordem não pula o primeiro pendente', () => {
  const levels = buildStudyLevels(list, progressFor({ q3: true }));
  assert.deepEqual(
    levels.map((level) => level.reached),
    [true, false, false, false, false],
  );
  assert.equal(levels[2].stars, 3);
});

test('categoria completa e categoria com uma pergunta ficam inteiras alcançadas', () => {
  const all = { q1: true, q2: true, q3: false, q4: null, q5: true };
  assert.ok(buildStudyLevels(list, progressFor(all)).every((level) => level.reached));
  const single = [list[0]];
  assert.deepEqual(
    buildStudyLevels(single, progressFor({}, ['q1'])).map((level) => level.reached),
    [true],
  );
  assert.deepEqual(
    buildStudyLevels(single, progressFor({ q1: false }, ['q1'])).map((level) => level.stars),
    [1],
  );
});

test('pergunta que o progresso ainda não conhece conta como pendente', () => {
  // Publicada entre o GET de perguntas e o de progresso.
  const progress = progressFor({ q1: true, q2: true }, ['q1', 'q2']);
  const levels = buildStudyLevels(list.slice(0, 3), progress);
  assert.deepEqual(
    levels.map((level) => level.reached),
    [true, true, true],
  );
  assert.equal(levels[2].stars, 0);
  // E pergunta do progresso que saiu da lista (despublicada) é ignorada.
  assert.equal(buildStudyLevels([list[1]], progress)[0].stars, 3);
});

test('C6 atual abre lacunas e conteudo sem depender de campos legados', () => {
  assert.equal(
    questionHeading({
      id: 'current',
      published: {
        type: 'FILL_BLANK',
        title: 'CDB',
        statement: 'O CDB rende ___ do CDI',
        answers: ['100%'],
      },
    }),
    'O CDB rende ___ do CDI',
  );
  assert.equal(
    learningContent({ type: 'LEARNING', title: 'Reserva', body: 'Conteudo atual' }),
    'Conteudo atual',
  );
  assert.equal(
    learningContent({
      type: 'LEARNING',
      title: 'Reserva',
      content: 'Conteudo legado',
      keyTakeaways: [],
    }),
    'Conteudo legado',
  );
});

test('resposta do back ({ id, published } com type dentro de published) abre o nivel', () => {
  // Formato de StudyTrackQuestionResponse e da secao 4 de contracts/study-track-c6.md do back.
  const response = JSON.parse(`[
    {"id":"a","published":{"type":"LEARNING","title":"O que e CDI?","body":"## CDI"}},
    {"id":"b","published":{"type":"MULTIPLE_CHOICE","statement":"Quantos meses?",
      "options":[{"text":"1","correct":false},{"text":"3 a 6","correct":true}]}},
    {"id":"c","published":{"type":"FILL_BLANK","title":"Reserva",
      "statement":"Alta ___.","answers":["liquidez"]}}
  ]`) as StudyQuestion[];
  assert.deepEqual(response.map(questionHeading), ['O que e CDI?', 'Quantos meses?', 'Alta ___.']);
  const first = response[0].published;
  assert.equal(first.type, 'LEARNING');
  if (first.type === 'LEARNING') assert.equal(learningContent(first), '## CDI');
});

test('tipo fora do C6 nao quebra a abertura do nivel', () => {
  const unknown = { id: 'x', published: { type: 'OUTRO' } } as unknown as StudyQuestion;
  assert.equal(questionHeading(unknown), '');
});
