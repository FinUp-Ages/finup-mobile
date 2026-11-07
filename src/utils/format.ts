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

/** Teto da escala do FinUp Score (o back calcula de 0 a 100). */
export const FIN_UP_SCORE_MAX = 100;

/**
 * FinUp Score para o badge da Home: 70 -> "70". Sem score (ainda nao calculado,
 * carregando ou falha) ou valor fora de 0..100 -> "-".
 */
export function formatFinUpScore(score: number | null | undefined): string {
  if (
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > FIN_UP_SCORE_MAX
  ) {
    return '-';
  }
  return String(Math.round(score));
}

/** Primeiro nome para saudacao: "  Ana Maria Souza " -> "Ana". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
