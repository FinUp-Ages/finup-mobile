import type { TransactionType } from '../types/transaction';
import { todayIsoDate } from './dates';
import { formatAmount } from './masks';

/**
 * UTILS - textos do widget da tela inicial (src/widgets): saudacao pelo horario,
 * resumo de gastos e um exemplo de registro que muda a cada atualizacao.
 *
 * Funcoes puras: quem busca usuario e transacoes e o widgetModel.
 */

export type WidgetContent = {
  /** "Boa noite, Marco" (sem nome quando nao ha sessao). */
  title: string;
  /** Resumo de gastos ou, sem dados, a chamada do widget. */
  subtitle: string;
  /** Exemplo de frase no campo, como o placeholder de uma busca. */
  tip: string;
};

export type ExpenseSummary = { today: number; month: number };

type TransactionLike = { type: TransactionType; amount: number; transactionDate: string };

export const WIDGET_DEFAULT_SUBTITLE = 'Registre gastos por texto ou voz';

// Curtos para caber numa linha do campo (~22 caracteres no widget 4x2).
export const WIDGET_TIPS = [
  'Ex.: almoço 25 reais',
  'Ex.: uber 18,50',
  'Ex.: mercado 132 reais',
  'Ex.: café 7 reais',
  'Ex.: farmácia 35 reais',
  'Ex.: gasolina 200',
] as const;

/** "Bom dia" das 5h ao meio-dia, "Boa tarde" ate as 18h, "Boa noite" no resto. */
export function greeting(now: Date, name?: string | null): string {
  const hour = now.getHours();
  const period =
    hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
  const trimmed = name?.trim();
  return trimmed ? `${period}, ${trimmed}` : period;
}

/** Troca de exemplo a cada minuto: cada atualizacao do widget tende a mostrar outro. */
export function pickTip(now: Date): string {
  return WIDGET_TIPS[Math.floor(now.getTime() / 60_000) % WIDGET_TIPS.length];
}

/** Primeiro dia do mes de `now`, no formato do back (yyyy-MM-dd). */
export function monthStartIsoDate(now: Date): string {
  return todayIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

/** Soma das saidas do dia e do periodo recebido (o mes corrente, no widgetModel). */
export function summarizeExpenses(
  transactions: TransactionLike[],
  todayIso: string,
): ExpenseSummary {
  return transactions.reduce<ExpenseSummary>(
    (summary, transaction) => {
      if (transaction.type !== 'EXPENSE') return summary;
      return {
        today: summary.today + (transaction.transactionDate === todayIso ? transaction.amount : 0),
        month: summary.month + transaction.amount,
      };
    },
    { today: 0, month: 0 },
  );
}

export function expenseSummaryText({ today, month }: ExpenseSummary): string {
  return `Hoje ${formatAmount(today)} · Mês ${formatAmount(month)}`;
}

/** Conteudo do widget; `data` null = sem sessao ou falha ao buscar (so saudacao e dica). */
export function buildWidgetContent(
  now: Date,
  data: { name: string | null; summary: ExpenseSummary } | null,
): WidgetContent {
  return {
    title: greeting(now, data?.name),
    subtitle: data ? expenseSummaryText(data.summary) : WIDGET_DEFAULT_SUBTITLE,
    tip: pickTip(now),
  };
}
