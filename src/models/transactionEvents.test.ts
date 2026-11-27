import assert from 'node:assert/strict';
import { test } from 'node:test';
import { transactionEvents } from './transactionEvents';

test('notifica assinantes e respeita cancelamento', () => {
  let first = 0;
  let second = 0;
  const unsubscribeFirst = transactionEvents.subscribe(() => first++);
  const unsubscribeSecond = transactionEvents.subscribe(() => second++);
  try {
    transactionEvents.notifyChanged();
    unsubscribeFirst();
    transactionEvents.notifyChanged();
    assert.equal(first, 1);
    assert.equal(second, 2);
  } finally {
    unsubscribeFirst();
    unsubscribeSecond();
  }
});
