import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTransactionsByType,
  sortTransactionsByDateDesc,
  formatMovementAmount,
  processHomeTransactions,
  DEFAULT_TYPE_FILTER,
  TYPE_FILTER_OPTIONS,
  type TransactionListItem,
} from './transactionFilters';
import type { Category } from '../types/transaction';

const mockTransactions: TransactionListItem[] = [
  {
    id: 'tx-1',
    categoryId: 'cat-salario',
    paymentMethodId: null,
    type: 'INCOME',
    description: 'Salário',
    amount: 5000,
    transactionDate: '2026-10-01',
    isRecurring: false,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'tx-2',
    categoryId: 'cat-mercado',
    paymentMethodId: null,
    type: 'EXPENSE',
    description: 'Supermercado',
    amount: 350.5,
    transactionDate: '2026-10-05',
    isRecurring: false,
    createdAt: '2026-10-05T14:00:00Z',
  },
  {
    id: 'tx-3',
    categoryId: 'cat-freela',
    paymentMethodId: null,
    type: 'INCOME',
    description: 'Freela',
    amount: 1200,
    transactionDate: '2026-10-07',
    isRecurring: false,
    createdAt: '2026-10-07T12:00:00Z',
  },
  {
    id: 'tx-4',
    categoryId: 'cat-luz',
    paymentMethodId: null,
    type: 'EXPENSE',
    description: 'Conta de Luz',
    amount: 120.75,
    transactionDate: '2026-10-05',
    isRecurring: false,
    createdAt: '2026-10-05T09:00:00Z',
  },
];

const mockCategories: Category[] = [
  { id: 'cat-salario', name: 'Salário', type: 'INCOME', isDefault: true },
  { id: 'cat-mercado', name: 'Alimentação', type: 'EXPENSE', isDefault: true },
  { id: 'cat-freela', name: 'Serviços', type: 'INCOME', isDefault: false },
  { id: 'cat-luz', name: 'Moradia', type: 'EXPENSE', isDefault: true },
];

test('DEFAULT_TYPE_FILTER deve ser ALL', () => {
  assert.strictEqual(DEFAULT_TYPE_FILTER, 'ALL');
});

test('TYPE_FILTER_OPTIONS deve conter Todos, Entrada e Saída', () => {
  assert.deepStrictEqual(TYPE_FILTER_OPTIONS, [
    { key: 'ALL', label: 'Todos' },
    { key: 'INCOME', label: 'Entrada' },
    { key: 'EXPENSE', label: 'Saída' },
  ]);
});

test('filterTransactionsByType com filtro ALL deve retornar todas as transações', () => {
  const result = filterTransactionsByType(mockTransactions, 'ALL');
  assert.strictEqual(result.length, 4);
  assert.deepStrictEqual(
    result.map((t) => t.id),
    ['tx-1', 'tx-2', 'tx-3', 'tx-4'],
  );
});

test('filterTransactionsByType com filtro INCOME deve retornar apenas entradas', () => {
  const result = filterTransactionsByType(mockTransactions, 'INCOME');
  assert.strictEqual(result.length, 2);
  assert.ok(result.every((t) => t.type === 'INCOME'));
  assert.deepStrictEqual(
    result.map((t) => t.id),
    ['tx-1', 'tx-3'],
  );
});

test('filterTransactionsByType com filtro EXPENSE deve retornar apenas saídas', () => {
  const result = filterTransactionsByType(mockTransactions, 'EXPENSE');
  assert.strictEqual(result.length, 2);
  assert.ok(result.every((t) => t.type === 'EXPENSE'));
  assert.deepStrictEqual(
    result.map((t) => t.id),
    ['tx-2', 'tx-4'],
  );
});

test('filterTransactionsByType não deve mutar o array original', () => {
  const original = [...mockTransactions];
  filterTransactionsByType(mockTransactions, 'INCOME');
  assert.deepStrictEqual(mockTransactions, original);
});

test('filterTransactionsByType com lista vazia deve retornar array vazio', () => {
  const result = filterTransactionsByType([], 'EXPENSE');
  assert.deepStrictEqual(result, []);
});

test('sortTransactionsByDateDesc deve ordenar por transactionDate decrescente e desempate por createdAt', () => {
  const result = sortTransactionsByDateDesc(mockTransactions);
  assert.deepStrictEqual(
    result.map((t) => t.id),
    ['tx-3', 'tx-2', 'tx-4', 'tx-1'],
  );
});

test('sortTransactionsByDateDesc não deve mutar o array original', () => {
  const original = [...mockTransactions];
  sortTransactionsByDateDesc(mockTransactions);
  assert.deepStrictEqual(mockTransactions, original);
});

test('formatMovementAmount formata entradas e saídas com seus respectivos sinais', () => {
  assert.strictEqual(formatMovementAmount(100, 'INCOME'), '+ R$ 100,00');
  assert.strictEqual(formatMovementAmount(350.5, 'EXPENSE'), '- R$ 350,50');
  assert.strictEqual(formatMovementAmount(0, 'INCOME'), '+ R$ 0,00');
});

test('processHomeTransactions integra filtro, ordenação e formatação corretamente', () => {
  const resultAll = processHomeTransactions(mockTransactions, mockCategories, 'ALL');
  assert.strictEqual(resultAll.length, 4);
  assert.strictEqual(resultAll[0].id, 'tx-3');
  assert.strictEqual(resultAll[0].title, 'Freela');
  assert.strictEqual(resultAll[0].amount, '+ R$ 1.200,00');
  assert.strictEqual(resultAll[0].type, 'INCOME');

  const resultExpense = processHomeTransactions(mockTransactions, mockCategories, 'EXPENSE');
  assert.strictEqual(resultExpense.length, 2);
  assert.strictEqual(resultExpense[0].id, 'tx-2');
  assert.strictEqual(resultExpense[0].amount, '- R$ 350,50');
  assert.strictEqual(resultExpense[0].type, 'EXPENSE');

  const resultLimit = processHomeTransactions(mockTransactions, mockCategories, 'ALL', 2);
  assert.strictEqual(resultLimit.length, 2);
  assert.deepStrictEqual(
    resultLimit.map((t) => t.id),
    ['tx-3', 'tx-2'],
  );
});