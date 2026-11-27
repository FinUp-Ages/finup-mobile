import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatAmount,
  formatCurrency,
  formatPhone,
  parseCurrencyToNumber,
  sanitizeEmail,
  sanitizeName,
} from './masks';

test('mascaras preservam os limites de telefone e moeda brasileira', () => {
  assert.equal(formatPhone(''), '');
  assert.equal(formatPhone('51987654321'), '(51) 98765-4321');
  assert.equal(formatPhone('51 3456-7890'), '(51) 3456-7890');
  assert.equal(formatPhone('519876543210000'), '(51) 98765-4321');
  assert.equal(formatCurrency('001234'), 'R$ 12,34');
  assert.equal(formatAmount(-0.004), 'R$ 0,00');
  assert.equal(formatAmount(-12.555), '-R$ 12,56');
});

test('conversao e sanitizacao aceitam entradas brasileiras e rejeitam vazias', () => {
  assert.equal(parseCurrencyToNumber('R$ 1.500,75'), 1500.75);
  assert.equal(parseCurrencyToNumber('1.500'), 1500);
  assert.equal(parseCurrencyToNumber('1500.00'), 1500);
  assert.equal(parseCurrencyToNumber('  '), undefined);
  assert.equal(sanitizeName(" Ana-María O'Neil 123 "), " Ana-María O'Neil  ");
  assert.equal(sanitizeEmail(' Ana .Silva+teste@EXAMPLE.com '), 'ana.silva+teste@example.com');
});
