import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildStudyLevels,
  learningContent,
  nextUnreachedLevelIndex,
  questionHeading,
} from './studyTrack';
import type { StudyQuestion } from '../types/studyTrack';

const questions: StudyQuestion[] = [
  {
    id: 'q1',
    type: 'FILL_BLANK',
    publishedAt: '2026-10-20T19:00:00Z',
    published: {
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

test('nuvem acompanha o proximo nivel mesmo quando nao e o ultimo da lista', () => {
  const list = Array(5).fill(questions[0]);
  const atTwo = buildStudyLevels(list, true, 2);
  assert.equal(nextUnreachedLevelIndex(atTwo), 2);
  assert.equal(atTwo[1].reached, true);
  assert.equal(atTwo[2].reached, false); // O caminho 2 -> 3 usa a cor apagada.
  assert.equal(atTwo[2].stars, 0);
  assert.equal(nextUnreachedLevelIndex(buildStudyLevels(list, true, 3)), 3);
  assert.equal(nextUnreachedLevelIndex(buildStudyLevels(list, true, 5)), -1);
  assert.equal(nextUnreachedLevelIndex(buildStudyLevels(list, false, 2)), -1);
  assert.equal(nextUnreachedLevelIndex([]), -1);
});

test('C6 atual abre lacunas e conteudo sem depender de campos legados', () => {
  const metadata = { id: 'current', publishedAt: '2026-11-05T00:00:00Z' };
  assert.equal(
    questionHeading({
      ...metadata,
      type: 'FILL_BLANK',
      published: { title: 'CDB', statement: 'O CDB rende ___ do CDI', answers: ['100%'] },
    }),
    'O CDB rende ___ do CDI',
  );
  assert.equal(
    learningContent({
      ...metadata,
      type: 'LEARNING',
      published: { title: 'Reserva', body: 'Conteudo atual' },
    }),
    'Conteudo atual',
  );
  assert.equal(
    learningContent({
      ...metadata,
      type: 'LEARNING',
      published: { title: 'Reserva', content: 'Conteudo legado', keyTakeaways: [] },
    }),
    'Conteudo legado',
  );
});
