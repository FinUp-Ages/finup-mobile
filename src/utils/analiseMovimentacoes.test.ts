import assert from 'node:assert/strict';
import test from 'node:test';
import type { Category, TransactionListResponse } from '../types/transaction';
import { mapearMovimentacoes } from './analiseMovimentacoes';
import { calcularGastosCategorias } from './analiseGastosCategorias';

const categories: Category[] = [
  { id: 'lazer', name: 'Lazer', type: 'EXPENSE', isDefault: true },
  { id: 'educacao', name: 'Educação', type: 'EXPENSE', isDefault: true },
];
const expense: TransactionListResponse['transactions'][number] = {
  id: 'gasto',
  categoryId: 'lazer',
  paymentMethodId: null,
  type: 'EXPENSE',
  description: 'Livro registrado pelo assistente',
  amount: 1.23,
  transactionDate: '2026-11-12',
  isRecurring: false,
  createdAt: '2026-11-12T12:00:00Z',
};

test('a lista conserva o ID da categoria atual mesmo com descricao preenchida pela IA', () => {
  const [movement] = mapearMovimentacoes([expense], categories);
  assert.equal(movement.id, expense.id);
  assert.equal(movement.categoryId, 'lazer');
  assert.equal(movement.categoryName, 'Lazer');
  assert.equal(movement.title, expense.description);
});

test('a recarga apos reclassificar atualiza categoria e agrupamento sem mudar o gasto ou totais', () => {
  const updated = { ...expense, categoryId: 'educacao' };
  const [before] = mapearMovimentacoes([expense], categories);
  const [after] = mapearMovimentacoes([updated], categories);
  assert.equal(after.categoryId, 'educacao');
  assert.equal(after.categoryName, 'Educação');
  assert.deepEqual(
    { ...after, categoryId: before.categoryId, categoryName: before.categoryName },
    before,
  );
  const originalSummary = calcularGastosCategorias([expense], categories);
  const updatedSummary = calcularGastosCategorias([updated], categories);
  assert.equal(updatedSummary.total, originalSummary.total);
  assert.equal(updatedSummary.expenses[0].name, 'Educação');
  assert.equal(updatedSummary.expenses[0].amount, originalSummary.expenses[0].amount);
  assert.equal(updatedSummary.expenses[0].percentage, 100);
  assert.equal(expense.categoryId, 'lazer');
});

test('sem descricao a nova categoria passa a ser o titulo do gasto manual', () => {
  const [movement] = mapearMovimentacoes(
    [{ ...expense, description: null, categoryId: 'educacao' }],
    categories,
  );
  assert.equal(movement.title, 'Educação');
  assert.equal(movement.categoryName, 'Educação');
});
