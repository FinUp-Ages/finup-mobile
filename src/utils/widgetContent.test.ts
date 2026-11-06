import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWidgetContent,
  greeting,
  monthStartIsoDate,
  pickTip,
  summarizeExpenses,
  WIDGET_DEFAULT_SUBTITLE,
  WIDGET_TIPS,
} from './widgetContent';

const at = (hour: number, minute = 0) => new Date(2026, 10, 5, hour, minute);

test('greeting muda pelo horario e inclui o nome quando houver', () => {
  assert.equal(greeting(at(4, 59)), 'Boa noite');
  assert.equal(greeting(at(5)), 'Bom dia');
  assert.equal(greeting(at(11, 59), 'Marco'), 'Bom dia, Marco');
  assert.equal(greeting(at(12)), 'Boa tarde');
  assert.equal(greeting(at(18), '  '), 'Boa noite');
  assert.equal(greeting(at(23), null), 'Boa noite');
});

test('pickTip troca de exemplo a cada minuto e sempre devolve um da lista', () => {
  const first = pickTip(at(10, 0));
  const next = pickTip(at(10, 1));
  assert.notEqual(first, next);
  assert.ok(WIDGET_TIPS.includes(first as (typeof WIDGET_TIPS)[number]));
  assert.ok(WIDGET_TIPS.every((tip) => tip.length <= 22));
});

test('monthStartIsoDate devolve o dia 1 do mes local', () => {
  assert.equal(monthStartIsoDate(new Date(2026, 0, 31, 23, 30)), '2026-01-01');
  assert.equal(monthStartIsoDate(at(10)), '2026-11-01');
});

test('summarizeExpenses soma so saidas, separando as do dia', () => {
  const summary = summarizeExpenses(
    [
      { type: 'EXPENSE', amount: 25, transactionDate: '2026-11-05' },
      { type: 'EXPENSE', amount: 20.5, transactionDate: '2026-11-05' },
      { type: 'EXPENSE', amount: 100, transactionDate: '2026-11-02' },
      { type: 'INCOME', amount: 5000, transactionDate: '2026-11-05' },
    ],
    '2026-11-05',
  );
  assert.deepEqual(summary, { today: 45.5, month: 145.5 });
});

test('buildWidgetContent sem dados mostra so saudacao e a chamada padrao', () => {
  const content = buildWidgetContent(at(20), null);
  assert.equal(content.title, 'Boa noite');
  assert.equal(content.subtitle, WIDGET_DEFAULT_SUBTITLE);
});

test('buildWidgetContent com dados mostra nome e gastos do dia e do mes', () => {
  const content = buildWidgetContent(at(9), {
    name: 'Marco',
    summary: { today: 45.5, month: 1230 },
  });
  assert.equal(content.title, 'Bom dia, Marco');
  assert.match(content.subtitle, /^Hoje R\$\s?45,50 · Mês R\$\s?1\.230,00$/);
});
