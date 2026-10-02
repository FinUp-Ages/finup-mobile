/**
 * UTILS - datas no formato do back (yyyy-MM-dd, LocalDate), no fuso do aparelho.
 *
 * Sempre pela data local do aparelho: toISOString() usa UTC e, a noite no
 * Brasil, ja devolveria o dia seguinte.
 */
export function todayIsoDate(today: Date = new Date()): string {
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

/** Data local `days` dias antes de `from` (negativo avanca). */
export function addDays(from: Date, days: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
}

/** Data local `months` meses antes de `from`, limitando ao ultimo dia do mes destino. */
export function subtractMonths(from: Date, months: number): Date {
  const target = new Date(from.getFullYear(), from.getMonth() - months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(from.getDate(), lastDay));
}
