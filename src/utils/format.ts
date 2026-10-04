/**
 * UTILS - formatacao de valores vindos da API para exibicao. Valor em reais
 * usa o `formatAmount` de utils/masks.
 */

/** Data da API (yyyy-MM-dd) para dd/MM, sem passar por Date (evita fuso). */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return month && day ? `${day}/${month}` : isoDate;
}

/** Primeiro nome para saudacao: "  Ana Maria Souza " -> "Ana". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
