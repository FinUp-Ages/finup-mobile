import assert from 'node:assert/strict';
import test from 'node:test';
import type { AnaliseMovement } from '@/types/analise';
import { filtrarEOrdenarMovimentacoes } from './analiseFiltrosMovimentacoes';

const movements: AnaliseMovement[] = [
  {
    id: 'income',
    categoryId: 'salary',
    type: 'INCOME',
    amountValue: 1000,
    categoryName: 'Salario',
    createdAt: '2026-11-02T10:00:00Z',
    title: 'Salario',
    transactionDate: '2026-11-02',
    date: '2 nov.',
    amount: '+ R$ 1.000,00',
  },
  {
    id: 'expense-newer',
    categoryId: 'food',
    type: 'EXPENSE',
    amountValue: 100,
    categoryName: 'Alimentacao',
    createdAt: '2026-11-03T12:00:00Z',
    title: 'Mercado',
    transactionDate: '2026-11-03',
    date: '3 nov.',
    amount: '- R$ 100,00',
  },
  {
    id: 'expense-older',
    categoryId: 'transport',
    type: 'EXPENSE',
    amountValue: 100,
    categoryName: 'Transporte',
    createdAt: '2026-11-01T12:00:00Z',
    title: 'Onibus',
    transactionDate: '2026-11-03',
    date: '3 nov.',
    amount: '- R$ 100,00',
  },
];

test('filtra por tipo, ordena pelos criterios pedidos e nao altera a entrada', () => {
  const original = [...movements];

  assert.deepEqual(
    filtrarEOrdenarMovimentacoes(movements, 'EXPENSE', 'HIGHEST_AMOUNT').map(({ id }) => id),
    ['expense-newer', 'expense-older'],
  );
  assert.deepEqual(
    filtrarEOrdenarMovimentacoes(movements, 'ALL', 'LOWEST_AMOUNT').map(({ id }) => id),
    ['expense-newer', 'expense-older', 'income'],
  );
  assert.deepEqual(
    filtrarEOrdenarMovimentacoes(movements, 'ALL', 'NEWEST').map(({ id }) => id),
    ['expense-newer', 'expense-older', 'income'],
  );
  assert.deepEqual(movements, original);
});
