import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addDays, subtractMonths, todayIsoDate } from './dates';

test('formata data local com zeros e atravessa mudança de ano', () => {
  assert.equal(todayIsoDate(new Date(2026, 0, 2)), '2026-01-02');
  assert.equal(todayIsoDate(addDays(new Date(2026, 0, 1), -1)), '2025-12-31');
});

test('subtração de meses limita dia ao fim do mês, inclusive ano bissexto', () => {
  assert.equal(todayIsoDate(subtractMonths(new Date(2024, 2, 31), 1)), '2024-02-29');
  assert.equal(todayIsoDate(subtractMonths(new Date(2025, 2, 31), 1)), '2025-02-28');
});
