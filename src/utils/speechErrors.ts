import type { ExpoSpeechRecognitionErrorCode } from '@/models/speechRecognitionModel';

/**
 * UTIL - traducao dos codigos de erro do reconhecedor nativo para uma frase que
 * diga ao operador da POC o que fazer.
 */
const MESSAGES: Record<string, string> = {
  aborted: 'Captura interrompida.',
  'audio-capture': 'Não foi possível abrir o microfone. Outro app pode estar usando o áudio.',
  'bad-grammar': 'O serviço recusou a configuração enviada.',
  'client-error': 'O serviço de reconhecimento recusou a sessão. Tente novamente.',
  'language-not-supported':
    'O modelo offline de português não está instalado. Toque em "Baixar modelo offline".',
  network: 'O reconhecedor tentou usar a rede. Confirme que o modelo offline está instalado.',
  'no-speech': 'Nada foi captado. Fale mais perto do microfone e tente de novo.',
  'not-allowed': 'Permissão de microfone negada. Libere o microfone nas configurações do aparelho.',
  'service-not-allowed':
    'Nenhum serviço de reconhecimento habilitado. Verifique o app de assistente digital nas configurações.',
};

/** Mensagem em portugues para um erro do reconhecedor. */
export function describeSpeechError(
  code: ExpoSpeechRecognitionErrorCode | string,
  fallback?: string,
): string {
  return MESSAGES[code] ?? fallback ?? `Falha no reconhecimento (${code}).`;
}

/**
 * Erros que derrubam a sessao de vez: nao adianta tentar de novo sem antes
 * resolver alguma coisa no aparelho.
 */
export const FATAL_SPEECH_ERRORS: ReadonlySet<string> = new Set([
  'audio-capture',
  'bad-grammar',
  'language-not-supported',
  'not-allowed',
  'service-not-allowed',
]);
