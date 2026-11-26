import test from 'node:test';
import assert from 'node:assert/strict';
import { homeBannerKeys } from './homeBanners';

test('pending triage shows the score banner whatever the score', () => {
  for (const hasScore of [true, false, null]) {
    assert.deepEqual(homeBannerKeys('pending', hasScore), ['score', 'learning']);
  }
});

test('completed triage without FinUp Score brings the score banner back to ask for the income', () => {
  assert.deepEqual(homeBannerKeys('completed', false), ['score', 'learning']);
});

test('completed triage with score, or score not loaded yet, shows only learning', () => {
  assert.deepEqual(homeBannerKeys('completed', true), ['learning']);
  assert.deepEqual(homeBannerKeys('completed', null), ['learning']);
});

test('unknown triage keeps only the score banner', () => {
  for (const hasScore of [true, false, null]) {
    assert.deepEqual(homeBannerKeys('unknown', hasScore), ['score']);
  }
});
