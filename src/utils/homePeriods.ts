import { addDays, subtractMonths, todayIsoDate } from '@/utils/dates';

/** Periodos do card de saldo da Home (janela termina hoje, inclusive). */
export type HomePeriodKey = '7d' | '15d' | '30d' | '3m' | '6m' | '12m';

export type HomePeriodOption = {
  key: HomePeriodKey;
  /** Etiqueta do seletor e do badge do card. */
  label: string;
  from: (today: Date) => Date;
};

export const HOME_PERIODS: HomePeriodOption[] = [
  { key: '7d', label: 'Últimos 7 dias', from: (today) => addDays(today, -6) },
  { key: '15d', label: 'Últimos 15 dias', from: (today) => addDays(today, -14) },
  { key: '30d', label: 'Últimos 30 dias', from: (today) => addDays(today, -29) },
  { key: '3m', label: 'Últimos 3 meses', from: (today) => subtractMonths(today, 3) },
  { key: '6m', label: 'Últimos 6 meses', from: (today) => subtractMonths(today, 6) },
  { key: '12m', label: 'Últimos 12 meses', from: (today) => subtractMonths(today, 12) },
];

export const DEFAULT_HOME_PERIOD: HomePeriodKey = '7d';

export function homePeriodRange(key: HomePeriodKey, today: Date = new Date()) {
  const option = HOME_PERIODS.find((item) => item.key === key) ?? HOME_PERIODS[0];
  return { from: todayIsoDate(option.from(today)), to: todayIsoDate(today), label: option.label };
}
