/**
 * Monta o relatorio do roteiro de testes em Markdown.
 *
 * Funcao pura: recebe o que foi medido e devolve texto. E o que sai do aparelho
 * (pelo compartilhamento do sistema) e entra no documento da POC.
 */
import { SPEECH_LOCALE, TEST_PHRASES } from '@/constants/speech';
import { accuracyLabel } from '@/utils/speechText';
import type { DeviceSpeechSupport, TestPhraseResult } from '@/types/speech';

export type ReportInput = {
  support: DeviceSpeechSupport | null;
  results: readonly TestPhraseResult[];
  /** Ex.: "android 14". Vem da tela, que conhece a plataforma. */
  platform: string;
  generatedAt: number;
  /** Marcado por quem testa: o aparelho estava em modo avião? */
  airplaneMode: boolean;
};

/** Milissegundos legiveis. `null` vira travessao. */
export function formatMs(value: number | null): string {
  if (value === null) return '—';
  return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`;
}

function media(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function buildTranscriptionReport({
  support,
  results,
  platform,
  generatedAt,
  airplaneMode,
}: ReportInput): string {
  const date = new Date(generatedAt).toISOString().slice(0, 16).replace('T', ' ');

  const firstPartials = results
    .map((result) => result.metrics.firstPartialMs)
    .filter((value): value is number => value !== null);
  const finalizes = results
    .map((result) => result.metrics.finalizeMs)
    .filter((value): value is number => value !== null);
  const totals = results
    .map((result) => result.metrics.totalMs)
    .filter((value): value is number => value !== null);
  const rates = results
    .map((result) => result.wordErrorRate)
    .filter((value): value is number => value !== null);

  const approved = results.filter((result) => result.verdict === 'ok').length;

  const rows = TEST_PHRASES.map((phrase) => {
    const result = results.find((item) => item.phraseId === phrase.id);
    if (!result) {
      return `| ${phrase.expected} | _não executada_ | — | — | — | — |`;
    }
    const verdict = result.verdict ?? '—';
    const cells = [
      phrase.expected,
      result.transcript || '_(vazio)_',
      accuracyLabel(result.wordErrorRate),
      formatMs(result.metrics.firstPartialMs),
      formatMs(result.metrics.finalizeMs),
      verdict,
    ];
    return `| ${cells.join(' | ')} |`;
  }).join('\n');

  return [
    '# POC de transcrição de voz — resultado dos testes',
    '',
    `- **Data:** ${date} (UTC)`,
    `- **Plataforma:** ${platform}`,
    `- **Idioma:** ${SPEECH_LOCALE}`,
    `- **Modo avião durante o teste:** ${airplaneMode ? 'sim' : 'não'}`,
    `- **Reconhecimento no aparelho:** ${support?.onDeviceSupported ? 'suportado' : 'não suportado'}`,
    `- **Serviço on-device instalado:** ${support?.hasOnDevicePackage ? 'sim' : 'não'}`,
    `- **Modelo offline ${SPEECH_LOCALE}:** ${support?.hasOfflineLocale ? 'instalado' : 'não confirmado'}`,
    `- **Serviço padrão:** ${support?.defaultService || '—'}`,
    '',
    '## Frases',
    '',
    '| Frase falada | Transcrição | Acerto (palavras) | 1º parcial | Finalização | Veredito |',
    '| --- | --- | --- | --- | --- | --- |',
    rows,
    '',
    '## Resumo',
    '',
    `- Frases executadas: ${results.length} de ${TEST_PHRASES.length}`,
    `- Aprovadas por quem testou: ${approved}`,
    `- Acerto médio de palavras: ${accuracyLabel(media(rates))}`,
    `- Latência média do 1º parcial: ${formatMs(media(firstPartials))}`,
    `- Tempo médio de finalização: ${formatMs(media(finalizes))}`,
    `- Tempo total médio (início da captura → texto final): ${formatMs(media(totals))}`,
    '',
    '> Acerto de palavras é distância de edição entre o que foi falado e o que foi',
    '> transcrito, sem acento e sem pontuação. Número por extenso transcrito como',
    '> dígito conta como acerto apenas se a frase esperada também usar dígito.',
    '',
  ].join('\n');
}
