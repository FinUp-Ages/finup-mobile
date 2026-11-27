import assert from 'node:assert/strict';
import test from 'node:test';
import { accuracyLabel, normalizeTranscript, toWords, wordErrorRate } from './speechText';

test('normaliza acentos, pontuacao e espacos para a comparacao de voz', () => {
  assert.equal(normalizeTranscript('  Olá, MUNDO!  '), 'ola mundo');
  assert.deepEqual(toWords('ação... número 42'), ['acao', 'numero', '42']);
});

test('WER trata insercao, troca, frase vazia e taxa acima de um', () => {
  assert.equal(wordErrorRate('um dois', 'um dois'), 0);
  assert.equal(wordErrorRate('um dois', 'um tres'), 0.5);
  assert.equal(wordErrorRate('um', 'um dois tres'), 2);
  assert.equal(wordErrorRate('   ', 'qualquer coisa'), null);
  assert.equal(accuracyLabel(1.2), '0%');
  assert.equal(accuracyLabel(null), '—');
});
