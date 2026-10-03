import { formatCurrency } from '@/utils/masks';

/**
 * UTILS - formatacao de valores vindos da API para exibicao.
 */

/**
 * Valor em reais (number do JSON, ate 2 casas) para BRL: 1234.5 -> "R$ 1.234,50",
 * -10 -> "-R$ 10,00". Arredonda para centavos antes de formatar, para nao
 * exibir resto de ponto flutuante.
 */
export function formatBRL(value: number): string {
  const cents = Math.round(Math.abs(value) * 100);
  const sign = value < 0 && cents > 0 ? '-' : '';
  return `${sign}${formatCurrency(String(cents))}`;
}

/** Data da API (yyyy-MM-dd) para dd/MM, sem passar por Date (evita fuso). */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return month && day ? `${day}/${month}` : isoDate;
}

/** Primeiro nome para saudacao: "  Ana Maria Souza " -> "Ana". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
