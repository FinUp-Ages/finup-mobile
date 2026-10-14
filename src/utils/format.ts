/**
 * UTILS - formatacao de valores vindos da API para exibicao. Valor em reais
 * usa o `formatAmount` de utils/masks.
 */

/** Data da API (yyyy-MM-dd) para dd/MM, sem passar por Date (evita fuso). */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return month && day ? `${day}/${month}` : isoDate;
}

/** Duracao de audio em m:ss: 65000 -> "1:05". */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const seconds = totalSeconds % 60;
  return `${Math.floor(totalSeconds / 60)}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/** Primeiro nome para saudacao: "  Ana Maria Souza " -> "Ana". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
