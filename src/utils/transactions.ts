import type { TransactionPeriod } from '@/types/transaction';

function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRecentTransactionPeriod(today = new Date()): TransactionPeriod {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  from.setDate(from.getDate() - 6);
  // Nao usar toISOString(): o dia UTC pode diferir do calendario do aparelho.
  return { from: formatLocalDate(from), to: formatLocalDate(today) };
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatTransactionDate(date: string): string {
  // Datas sem horario nao devem sofrer conversao de fuso.
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}
