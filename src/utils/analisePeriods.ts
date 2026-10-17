import type { AnalisePeriodKey } from '@/types/analise';
import { addDays, todayIsoDate } from '@/utils/dates';

export type AnalisePeriodOption = {
  key: AnalisePeriodKey;
  label: string;
  from: (today: Date) => Date;
};

export const ANALISE_PERIODS: AnalisePeriodOption[] = [
  { key: '7d', label: 'Últimos 7 dias', from: (today) => addDays(today, -6) },
  { key: '10d', label: 'Últimos 10 dias', from: (today) => addDays(today, -9) },
  { key: '20d', label: 'Últimos 20 dias', from: (today) => addDays(today, -19) },
];

export const DEFAULT_ANALISE_PERIOD: AnalisePeriodKey = '7d';
// Recebe um periodo '7d' , '10d' ou '20d' e retorna from, to, e a label que aparece no botão de seleção de período.
export function analisePeriodRange(key: AnalisePeriodKey, today: Date = new Date()) {
  const period = ANALISE_PERIODS.find((item) => item.key === key) ?? ANALISE_PERIODS[0];
  return { from: todayIsoDate(period.from(today)), label: period.label, to: todayIsoDate(today) };
}

//Define como 30 dias o perído analisado para gerar os alertas.
export function analiseAlertRange(today: Date = new Date()) {
  return { from: todayIsoDate(addDays(today, -29)), to: todayIsoDate(today) };
}
