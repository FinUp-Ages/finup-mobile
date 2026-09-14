/**
 * TYPES - contratos da POC de transcricao de voz.
 *
 * Nada aqui descreve transacao, valor ou categoria: a POC transforma audio em
 * texto e para por ai. Interpretar a frase e trabalho de outra camada.
 */

/** Estado do reconhecedor ao longo de uma captura. */
export type TranscriptionStatus =
  /** Nada acontecendo: pronto para gravar. */
  | 'idle'
  /** Permissao concedida e start() chamado; o microfone ainda nao abriu. */
  | 'starting'
  /** Microfone aberto: resultados parciais podem chegar a qualquer momento. */
  | 'listening'
  /** Fala encerrada; aguardando o resultado final do reconhecedor. */
  | 'finishing';

/**
 * Tempos de uma captura, em milissegundos. `null` enquanto o evento
 * correspondente nao chegou.
 */
export interface TranscriptionMetrics {
  /** Inicio da fala -> primeiro parcial. E a latencia percebida. */
  firstPartialMs: number | null;
  /** Fim da fala -> resultado final. E o tempo de fechar a transcricao. */
  finalizeMs: number | null;
  /**
   * Inicio da captura -> resultado final. A contagem comeca depois da permissao
   * concedida: o dialogo do sistema, que so aparece na primeira vez, ficaria
   * dentro da medida.
   */
  totalMs: number | null;
  /** Duracao da fala detectada (inicio -> fim da fala). */
  speechMs: number | null;
  /** Quantos parciais chegaram antes do resultado final. */
  partialCount: number;
}

/** Resultado de uma captura concluida. */
export interface TranscriptionResult {
  /** Texto final devolvido pelo reconhecedor. */
  text: string;
  metrics: TranscriptionMetrics;
  /** Momento (epoch ms) em que o resultado final chegou. */
  finishedAt: number;
  /**
   * `true` quando o aparelho anuncia suporte a reconhecimento local. Toda
   * captura da POC e pedida com `requiresOnDeviceRecognition`, entao e isto que
   * separa "rodou no aparelho" de "caiu no servico de rede".
   */
  onDevice: boolean;
}

/**
 * O que o aparelho oferece de reconhecimento de fala. Lido na abertura da tela:
 * e o que decide se a POC consegue mesmo rodar offline.
 */
export interface DeviceSpeechSupport {
  /** O aparelho anuncia suporte a reconhecimento no proprio aparelho. */
  onDeviceSupported: boolean;
  /** Existe algum servico de reconhecimento habilitado. */
  recognitionAvailable: boolean;
  /** Pacotes de reconhecimento instalados (ex.: com.google.android.as). */
  services: string[];
  /** Pacote do servico padrao do sistema. */
  defaultService: string;
  /** Locales com modelo baixado no aparelho: funcionam sem internet. */
  installedLocales: string[];
  /** O pacote on-device preferido esta instalado. */
  hasOnDevicePackage: boolean;
  /** O modelo do idioma da POC esta baixado. */
  hasOfflineLocale: boolean;
}

/** Uma frase do roteiro de testes da POC. */
export interface TestPhrase {
  id: string;
  /** Frase que o operador deve falar, exatamente como esta escrita. */
  expected: string;
}

/** Julgamento manual de quem executa o roteiro. */
export type TestVerdict = 'ok' | 'ajustar';

/** Resultado de uma frase do roteiro. */
export interface TestPhraseResult {
  phraseId: string;
  expected: string;
  transcript: string;
  metrics: TranscriptionMetrics;
  /** Taxa de erro por palavra (0 = identico). `null` quando nao ha comparacao. */
  wordErrorRate: number | null;
  verdict: TestVerdict | null;
  onDevice: boolean;
  finishedAt: number;
}
