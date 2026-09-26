import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';
import {
  abortTranscription,
  buildRecognitionOptions,
  downloadOfflineModel,
  readDeviceSupport,
  requestSpeechPermission,
  startTranscription,
  stopTranscription,
  useSpeechRecognitionEvent,
  VOLUME_RANGE,
} from '@/models/speechRecognitionModel';
import { describeSpeechError, FATAL_SPEECH_ERRORS } from '@/utils/speechErrors';
import type {
  DeviceSpeechSupport,
  TranscriptionMetrics,
  TranscriptionResult,
  TranscriptionStatus,
} from '@/types/speech';

/**
 * VIEWMODEL - uma captura de voz do inicio ao fim, com os tempos medidos.
 *
 * Guarda o estado da captura, assina os eventos do reconhecedor e chama o Model.
 * A View observa o que este hook expoe — ela nao sabe que existe modulo nativo.
 *
 * O que ele NAO faz: interpretar a frase. O resultado e texto puro; extrair
 * valor, categoria ou data e trabalho de outra camada.
 */
interface UseSpeechCaptureOptions {
  /** Chamado uma vez por captura, quando o resultado final chega. */
  onResult?: (result: TranscriptionResult) => void;
}

/** Marcos de tempo da captura em andamento. Ficam em ref: nao renderizam. */
interface Timeline {
  startedAt: number;
  speechStartAt: number;
  speechEndAt: number;
  firstPartialMs: number | null;
  partialCount: number;
}

const EMPTY_TIMELINE: Timeline = {
  firstPartialMs: null,
  partialCount: 0,
  speechEndAt: 0,
  speechStartAt: 0,
  startedAt: 0,
};

/** Volume nativo (-2 a 10) normalizado em 0..1 para a barra de nivel. */
function toLevel(value: number): number {
  const { max, min } = VOLUME_RANGE;
  if (value <= min) return 0;
  return Math.min(1, (value - min) / (max - min));
}

export function useSpeechCaptureViewModel({ onResult }: UseSpeechCaptureOptions = {}) {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [partial, setPartial] = useState('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [support, setSupport] = useState<DeviceSpeechSupport | null>(null);
  const [loadingSupport, setLoadingSupport] = useState(true);

  /**
   * Amplitude do microfone: anima direto, sem render por amostra.
   * `useMemo` e nao `useRef` porque ler `.current` durante o render e proibido
   * pelas regras do React Compiler que o eslint-config-expo aplica.
   */
  const micLevel = useMemo(() => new Animated.Value(0), []);

  /** Marcos de tempo: so escritos e lidos dentro de handlers, nunca no render. */
  const timeline = useRef<Timeline>({ ...EMPTY_TIMELINE });
  /** Evita entregar dois resultados para a mesma captura. */
  const resultDelivered = useRef(false);

  /* ---------------- capacidades do aparelho ---------------- */

  const refreshSupport = useCallback(async () => {
    try {
      const next = await readDeviceSupport();
      setSupport(next);
    } catch (cause) {
      setError(`Não foi possível ler as capacidades do aparelho: ${String(cause)}`);
    } finally {
      setLoadingSupport(false);
    }
  }, []);

  // Leitura unica na montagem. O `await` tira o setState do corpo do efeito:
  // nao ha render em cascata, so a resposta de uma consulta ao sistema.
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const next = await readDeviceSupport();
        if (alive) setSupport(next);
      } catch (cause) {
        if (alive) setError(`Não foi possível ler as capacidades do aparelho: ${String(cause)}`);
      } finally {
        if (alive) setLoadingSupport(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ---------------- eventos do reconhecedor ---------------- */

  useSpeechRecognitionEvent('start', () => setStatus('listening'));

  useSpeechRecognitionEvent('speechstart', () => {
    timeline.current.speechStartAt = Date.now();
  });

  useSpeechRecognitionEvent('speechend', () => {
    timeline.current.speechEndAt = Date.now();
    setStatus('finishing');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    const now = Date.now();
    const marks = timeline.current;

    if (!event.isFinal) {
      marks.partialCount += 1;
      if (marks.firstPartialMs === null && marks.speechStartAt > 0) {
        marks.firstPartialMs = now - marks.speechStartAt;
      }
      setPartial(text);
      return;
    }

    if (resultDelivered.current) return;
    resultDelivered.current = true;

    const metrics: TranscriptionMetrics = {
      finalizeMs: marks.speechEndAt > 0 ? now - marks.speechEndAt : null,
      firstPartialMs: marks.firstPartialMs,
      partialCount: marks.partialCount,
      speechMs:
        marks.speechStartAt > 0 && marks.speechEndAt > 0
          ? marks.speechEndAt - marks.speechStartAt
          : null,
      totalMs: marks.startedAt > 0 ? now - marks.startedAt : null,
    };

    const finished: TranscriptionResult = {
      finishedAt: now,
      metrics,
      onDevice: support?.onDeviceSupported ?? false,
      text,
    };

    setPartial('');
    setResult(finished);
    // Sem ref: `useSpeechRecognitionEvent` sempre invoca o listener mais recente,
    // entao esta closure ja enxerga o `onResult` do render atual.
    onResult?.(finished);
  });

  useSpeechRecognitionEvent('nomatch', () => {
    setNotice('O reconhecedor não entendeu nada. Fale mais perto do microfone.');
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    Animated.timing(micLevel, {
      duration: 120,
      toValue: toLevel(event.value),
      useNativeDriver: true,
    }).start();
  });

  useSpeechRecognitionEvent('error', (event) => {
    // `no-speech` e `aborted` sao fim de sessao normal, nao falha da POC.
    if (event.error === 'no-speech' || event.error === 'aborted') {
      setNotice(describeSpeechError(event.error, event.message));
      return;
    }
    setError(describeSpeechError(event.error, event.message));
    if (FATAL_SPEECH_ERRORS.has(event.error)) {
      setStatus('idle');
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setStatus('idle');
    setPartial('');
    micLevel.setValue(0);
  });

  /* ---------------- acoes ---------------- */

  const start = useCallback(async () => {
    setError(null);
    setNotice(null);
    setResult(null);
    setPartial('');
    timeline.current = { ...EMPTY_TIMELINE };
    resultDelivered.current = false;

    const granted = await requestSpeechPermission();
    if (!granted) {
      setError('Permissão de microfone negada. Sem ela a POC não consegue gravar.');
      return;
    }

    if (support && !support.recognitionAvailable) {
      setError('Nenhum serviço de reconhecimento de fala disponível neste aparelho.');
      return;
    }

    setStatus('starting');
    timeline.current.startedAt = Date.now();
    try {
      startTranscription(buildRecognitionOptions(support));
    } catch (cause) {
      setStatus('idle');
      setError(`Não foi possível iniciar a captura: ${String(cause)}`);
    }
  }, [support]);

  const stop = useCallback(() => {
    // stop() entrega o ultimo resultado final; abort() jogaria fora.
    setStatus('finishing');
    stopTranscription();
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setPartial('');
    setError(null);
    setNotice(null);
  }, []);

  const downloadModel = useCallback(async () => {
    setNotice('Pedindo o download do modelo offline...');
    try {
      const outcome = await downloadOfflineModel();
      setNotice(`${outcome.status}: ${outcome.message}`);
    } catch (cause) {
      setNotice(`Download não concluído: ${String(cause)}`);
    }
    await refreshSupport();
  }, [refreshSupport]);

  /** Sair da tela no meio de uma captura deixaria o microfone aberto. */
  useEffect(
    () => () => {
      abortTranscription();
    },
    [],
  );

  const isRecording = status === 'starting' || status === 'listening' || status === 'finishing';

  return {
    downloadModel,
    error,
    isRecording,
    loadingSupport,
    micLevel,
    notice,
    partial,
    reset,
    result,
    start,
    status,
    stop,
    support,
  };
}
