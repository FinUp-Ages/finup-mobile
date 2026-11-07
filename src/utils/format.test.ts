import test from 'node:test';
import assert from 'node:assert/strict';
import { formatFinUpScore } from './format';

test('formatFinUpScore shows the score returned by the back', () => {
  assert.equal(formatFinUpScore(70), '70');
  assert.equal(formatFinUpScore(0), '0');
  assert.equal(formatFinUpScore(100), '100');
});

test('formatFinUpScore falls back to "-" when there is no valid score', () => {
  assert.equal(formatFinUpScore(undefined), '-');
  assert.equal(formatFinUpScore(null), '-');
  assert.equal(formatFinUpScore(Number.NaN), '-');
  assert.equal(formatFinUpScore(-1), '-');
  assert.equal(formatFinUpScore(101), '-');
  // Valor na escala antiga (0 a 1000), ainda nao convertido no banco.
  assert.equal(formatFinUpScore(658), '-');
});
