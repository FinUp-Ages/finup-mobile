import test from 'node:test';
import assert from 'node:assert/strict';
import type { TriageQuestion } from '../types/triage';
import { answerError, compatibleAnswers, submissionAnswers, visibleQuestions } from './triage';

const flag: TriageQuestion = {
  id: 'HAS_DEBT', text: 'Dívidas?', type: 'BOOLEAN', required: true,
  options: null, min: null, max: null, decimals: null, requiredWhen: null,
};
const amount: TriageQuestion = {
  ...flag, id: 'DEBT_TOTAL_AMOUNT', type: 'NUMBER', min: 0, max: 100000000, decimals: 2,
  requiredWhen: { questionId: 'HAS_DEBT', equals: true },
};
const choice: TriageQuestion = {
  ...flag, id: 'INTERESTS', type: 'MULTIPLE_CHOICE', required: false,
  options: [{ value: 'CDB', label: 'CDB' }, { value: 'STOCKS', label: 'Ações' }],
};

test('false and zero are valid required answers; empty values are not', () => {
  assert.equal(answerError(flag, false), null);
  assert.equal(answerError(amount, 0), null);
  assert.ok(answerError(flag, undefined));
  assert.ok(answerError(amount, ''));
});

test('numeric ranges, integer counts, decimals and non-finite values follow metadata', () => {
  for (const value of [-1, 100000001, Infinity, NaN, 1.001, '1,50']) assert.ok(answerError(amount, value));
  assert.equal(answerError(amount, 1234.56), null);
  assert.equal(answerError(amount, 0.29), null);
  assert.ok(answerError({ ...amount, decimals: 0 }, 1.5));
});

test('conditional answers are removed when parent changes; false conditions also work', () => {
  const questions = [flag, amount];
  assert.equal(visibleQuestions(questions, { HAS_DEBT: true }).length, 2);
  assert.equal(visibleQuestions(questions, { HAS_DEBT: false }).length, 1);
  assert.deepEqual(submissionAnswers(questions, { HAS_DEBT: false, DEBT_TOTAL_AMOUNT: 100, UNKNOWN: true }), { HAS_DEBT: false });
  assert.equal(visibleQuestions([flag, { ...amount, requiredWhen: { questionId: flag.id, equals: false } }], { HAS_DEBT: false }).length, 2);
});

test('choice validation rejects unknown or duplicate options and permits optional empty selection', () => {
  assert.equal(answerError(choice, []), null);
  assert.equal(answerError(choice, ['CDB', 'STOCKS']), null);
  assert.ok(answerError(choice, ['CDB', 'CDB']));
  assert.ok(answerError(choice, ['UNKNOWN']));
  const single = { ...choice, type: 'SINGLE_CHOICE' as const, required: true };
  assert.equal(answerError(single, 'CDB'), null);
  assert.ok(answerError(single, 'UNKNOWN'));
  assert.ok(answerError(single, ['CDB']));
});

test('prefill retains compatible responses across versions without sending obsolete fields', () => {
  assert.deepEqual(compatibleAnswers([flag, amount, choice], {
    HAS_DEBT: true, DEBT_TOTAL_AMOUNT: 42.5, INTERESTS: ['OLD_OPTION'], OLD_QUESTION: 'old',
  }), { HAS_DEBT: true, DEBT_TOTAL_AMOUNT: 42.5 });
  assert.deepEqual(submissionAnswers([flag, choice], { HAS_DEBT: false, INTERESTS: [] }), { HAS_DEBT: false, INTERESTS: [] });
});
