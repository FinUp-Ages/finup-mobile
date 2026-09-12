/**
 * Constantes da POC de transcricao de voz.
 *
 * Tudo que e ajuste do reconhecedor mora aqui: a tela e o hook nao carregam
 * numero magico.
 */
import type { TestPhrase } from '@/types/speech';

/** Idioma da POC. O modelo offline precisa estar baixado para este locale. */
export const SPEECH_LOCALE = 'pt-BR';

/**
 * Servico de reconhecimento no proprio aparelho do Android
 * ("Speech Services by Google" / Android System Intelligence). E ele que
 * mantem a transcricao funcionando sem internet.
 */
export const ON_DEVICE_SERVICE_PACKAGE = 'com.google.android.as';

/**
 * Silencio que encerra a captura, em ms. A POC e de frase curta: fechar rapido
 * demais corta a fala no meio, devagar demais faz o usuario esperar a toa.
 */
export const SILENCE_TIMEOUT_MS = 1_500;

/** Intervalo dos eventos de volume que alimentam a barra de nivel do microfone. */
export const VOLUME_EVENT_INTERVAL_MS = 100;

/**
 * Faixa util do valor de volume do modulo nativo (-2 a 10; abaixo de 0 e
 * inaudivel). Serve para normalizar a amplitude em 0..1.
 */
export const VOLUME_RANGE = { min: 0, max: 8 } as const;

/**
 * Roteiro de teste do ticket da POC. Frases curtas de movimentacao financeira,
 * escolhidas para exercitar valor, verbo e estabelecimento.
 */
export const TEST_PHRASES: readonly TestPhrase[] = [
  { id: 'mercado', expected: 'Gastei 50 reais no mercado.' },
  { id: 'gasolina', expected: 'Paguei 120 reais de gasolina.' },
  { id: 'lanche', expected: 'Comprei um lanche por 28 reais.' },
  { id: 'freela', expected: 'Recebi 500 reais de um freela.' },
  { id: 'farmacia', expected: 'Gastei 39 e 90 na farmácia.' },
] as const;
