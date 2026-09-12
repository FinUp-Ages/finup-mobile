/**
 * Tipos compartilhados da POC de transcricao de voz (audio -> texto).
 *
 * Nada aqui descreve transacao, valor ou categoria: a interpretacao do texto e
 * responsabilidade de outra camada. Esta POC entrega texto e nada mais.
 */

/** Estado do reconhecedor ao longo de uma captura. */
export type TranscriptionStatus =
  /** Nada acontecendo: pronto para gravar. */
  | 'idle'
  /** Permissao pedida e `start()` chamado; o servico ainda nao abriu o microfone. */
  | 'starting'
  /** Microfone aberto, resultados parciais podem chegar a qualquer momento. */
  | 'listening'
  /** Fala encerrada; aguardando o resultado final do reconhecedor. */
  | 'finishing';

/**
 * Tempos medidos em uma captura. `null` enquanto o evento correspondente nao
 * chegou. Todos em milissegundos.
 */
export type TranscriptionMetrics = {
  /** Inicio da fala -> primeiro resultado parcial. E a latencia percebida. */
  firstPartialMs: number | null;
  /** Fim da fala -> resultado final. E o tempo de "fechar" a transcricao. */
  finalizeMs: number | null;
  /**
   * Inicio da captura -> resultado final. Tempo total do fluxo.
   * A contagem comeca depois da permissao concedida: o dialogo do sistema, que
   * so aparece na primeira vez, ficaria dentro da medida.
   */
  totalMs: number | null;
  /** Duracao da fala detectada (inicio -> fim da fala). */
  speechMs: number | null;
  /** Quantos eventos parciais chegaram antes do final. */
  partialCount: number;
};

/** Resultado de uma captura concluida. */
export type TranscriptionResult = {
  /** Texto final devolvido pelo reconhecedor. */
  text: string;
  metrics: TranscriptionMetrics;
  /** Momento (epoch ms) em que o resultado final chegou. */
  finishedAt: number;
  /**
   * `true` quando o aparelho anuncia suporte a reconhecimento local. Toda captura
   * da POC e pedida com `requiresOnDeviceRecognition`, entao e isto que separa
   * "rodou no aparelho" de "caiu no servico de rede".
   */
  onDevice: boolean;
};

/**
 * O que o aparelho oferece de reconhecimento de fala. Lido uma vez, na abertura
 * da tela: e o que decide se a POC consegue mesmo rodar offline.
 */
export type DeviceSpeechSupport = {
  /** O aparelho anuncia suporte a reconhecimento on-device. */
  onDeviceSupported: boolean;
  /** Existe algum servico de reconhecimento habilitado. */
  recognitionAvailable: boolean;
  /** Pacotes de reconhecimento instalados (ex.: com.google.android.as). */
  services: string[];
  /** Pacote do servico padrao do sistema. */
  defaultService: string;
  /** Locales com modelo ja baixado no aparelho (funcionam sem internet). */
  installedLocales: string[];
  /** O pacote on-device preferido esta instalado. */
  hasOnDevicePackage: boolean;
  /** O modelo do idioma da POC esta baixado. */
  hasOfflineLocale: boolean;
};

/** Uma frase do roteiro de testes sugerido no ticket da POC. */
export type TestPhrase = {
  id: string;
  /** Frase que o operador deve falar, exatamente como esta escrita. */
  expected: string;
};

/** Julgamento manual de quem executa o roteiro. */
export type TestVerdict = 'ok' | 'ajustar';

/** Resultado de uma frase do roteiro. */
export type TestPhraseResult = {
  phraseId: string;
  expected: string;
  transcript: string;
  metrics: TranscriptionMetrics;
  /** Taxa de erro por palavra (0 = identico). `null` quando nao ha o que comparar. */
  wordErrorRate: number | null;
  verdict: TestVerdict | null;
  onDevice: boolean;
  finishedAt: number;
};
