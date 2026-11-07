import type { AnalisePeriodKey } from '@/types/analise';
import { HOME_PERIODS, homePeriodRange, type HomePeriodOption } from '@/utils/homePeriods';

export type AnalisePeriodOption = HomePeriodOption;

export const ANALISE_PERIODS: AnalisePeriodOption[] = HOME_PERIODS;

export const DEFAULT_ANALISE_PERIOD: AnalisePeriodKey = '7d';
// Recebe um período da Home e retorna from, to e a etiqueta exibida no seletor.
export function analisePeriodRange(key: AnalisePeriodKey, today: Date = new Date()) {
  return homePeriodRange(key, today);
}

// Define como 30 dias o período analisado para gerar os alertas.
export function analiseAlertRange(today: Date = new Date()) {
  return homePeriodRange('30d', today);
}
