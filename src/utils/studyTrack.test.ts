import assert from 'node:assert/strict';
import test from 'node:test';
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

test('dados reais nao inventam estrelas nem bloqueiam perguntas publicadas', () => {
  const levels = buildStudyLevels(Array(5).fill(questions[0]), false);
  assert.ok(levels.every((level) => level.stars === 0 && level.reached));
  assert.deepEqual(
    levels.map((level) => level.number),
    [1, 2, 3, 4, 5],
  );
});
test('demonstracao separa estrelas e trecho nao alcancado', () => {
  const levels = buildStudyLevels(Array(5).fill(questions[0]), true);
  assert.deepEqual(
    levels.map((level) => level.stars),
    [3, 3, 3, 0, 0],
  );
  assert.equal(levels[4].reached, false);
  assert.deepEqual(buildStudyLevels([], true), []);
});
test('abrir lacunas nao revela respostas embutidas no contrato', () => {
  assert.equal(questionHeading(questions[0]), 'Prefira alta _____ e baixo _____.');
});

test('todos os niveis depois do atual ficam nao alcancados (com nuvem), mesmo no meio da lista', () => {
  const list = Array(5).fill(questions[0]);
  const reached = (current: number, demo = true) =>
    buildStudyLevels(list, demo, current).map((level) => level.reached);
  // O caminho 2 -> 3 usa a cor apagada e os niveis 3, 4 e 5 recebem nuvem.
  assert.deepEqual(reached(2), [true, true, false, false, false]);
  assert.equal(buildStudyLevels(list, true, 2)[2].stars, 0);
  assert.deepEqual(reached(3), [true, true, true, false, false]);
  assert.deepEqual(reached(5), [true, true, true, true, true]);
  assert.deepEqual(reached(2, false), [true, true, true, true, true]);
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
