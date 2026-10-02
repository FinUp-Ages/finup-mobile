/**
 * UTILS - periodos de consulta para a API.
 *
 * Sempre pela data local do aparelho: toISOString() usa UTC e, a noite no
 * Brasil, ja devolveria o dia seguinte.
 */

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

export type DatePeriod = {
  /** yyyy-MM-dd, inclusivo */
  from: string;
  /** yyyy-MM-dd, inclusivo */
  to: string;
  /** Nome do mes para exibicao, ex.: "Outubro" */
  label: string;
};

function toApiDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Mes corrente ate hoje: do dia 1 ao dia de `today`. */
export function currentMonthPeriod(today: Date = new Date()): DatePeriod {
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: toApiDate(firstDay),
    to: toApiDate(today),
    label: MONTH_NAMES[today.getMonth()],
  };
}
