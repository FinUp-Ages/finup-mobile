/// <reference types="jest" />
import { TEST_PHRASES } from './transcriptionTestScriptModel';
test('roteiro tem frases não vazias e identificadores únicos', () => {
  expect(TEST_PHRASES.length).toBeGreaterThan(0);
  expect(new Set(TEST_PHRASES.map((phrase) => phrase.id)).size).toBe(TEST_PHRASES.length);
  expect(TEST_PHRASES.every((phrase) => phrase.expected.trim().length > 0)).toBe(true);
});
