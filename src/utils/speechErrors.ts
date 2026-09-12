/**
 * Traducao dos codigos de erro do reconhecedor nativo para uma frase que diga
 * ao operador da POC o que fazer.
 */
import type { ExpoSpeechRecognitionErrorCode } from '@/services/speechRecognition';

const MESSAGES: Record<string, string> = {
  'not-allowed': 'Permissão de microfone negada. Libere o microfone nas configurações do aparelho.',
  'service-not-allowed':
    'Nenhum serviço de reconhecimento habilitado. Verifique o app de assistente digital nas configurações.',
  'language-not-supported':
    'O modelo offline de português não está instalado. Toque em "Baixar modelo offline".',
  'audio-capture': 'Não foi possível abrir o microfone. Outro app pode estar usando o áudio.',
  'no-speech': 'Nada foi captado. Fale mais perto do microfone e tente de novo.',
  network: 'O reconhecedor tentou usar a rede. Confirme que o modelo offline está instalado.',
  aborted: 'Captura interrompida.',
  'bad-grammar': 'O serviço recusou a configuração enviada.',
  'client-error': 'O serviço de reconhecimento recusou a sessão. Tente novamente.',
};

/** Mensagem em português para um erro do reconhecedor. */
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
  'not-allowed',
  'service-not-allowed',
  'language-not-supported',
  'audio-capture',
  'bad-grammar',
]);
