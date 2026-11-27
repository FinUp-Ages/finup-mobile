import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ANALISE_PERIODS,
  DEFAULT_ANALISE_PERIOD,
  analiseAlertRange,
  analisePeriodRange,
} from './analisePeriods';

test('periodos da analise reutilizam a janela inclusiva da Home', () => {
  const today = new Date(2026, 10, 26);

  assert.equal(DEFAULT_ANALISE_PERIOD, '7d');
  assert.equal(ANALISE_PERIODS.length, 6);
  assert.deepEqual(analisePeriodRange('7d', today), {
    from: '2026-11-20',
    to: '2026-11-26',
    label: 'Últimos 7 dias',
  });
  assert.deepEqual(analiseAlertRange(today), {
    from: '2026-10-28',
    to: '2026-11-26',
    label: 'Últimos 30 dias',
  });
});
