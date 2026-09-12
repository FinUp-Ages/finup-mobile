/**
 * Hook da POC: uma captura de voz do comeco ao fim, com os tempos medidos.
 *
 * Cadeia do projeto, com o modulo nativo no lugar da API:
 *   tela -> hook -> service (@/services/speechRecognition) -> modulo nativo
 *
 * O que ele NAO faz: interpretar a frase. O resultado e texto puro; extrair
 * valor, categoria ou data e trabalho de outra camada.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { VOLUME_RANGE } from '@/constants/speech';
import {
  abortTranscription,
  buildRecognitionOptions,
  downloadOfflineModel,
  readDeviceSupport,
  requestSpeechPermission,
  startTranscription,
  stopTranscription,
  useSpeechRecognitionEvent,
} from '@/services/speechRecognition';
import { FATAL_SPEECH_ERRORS, describeSpeechError } from '@/utils/speechErrors';
import type {
  DeviceSpeechSupport,
  TranscriptionMetrics,
  TranscriptionResult,
  TranscriptionStatus,
} from '@/types/speech';

type UseSpeechTranscriptionOptions = {
  /** Chamado uma vez por captura, quando o resultado final chega. */
  onResult?: (result: TranscriptionResult) => void;
};

/** Marcos de tempo da captura em andamento. Ficam em ref: nao renderizam. */
type Timeline = {
  startedAt: number;
  speechStartAt: number;
  speechEndAt: number;
  firstPartialMs: number | null;
  partialCount: number;
};

const EMPTY_TIMELINE: Timeline = {
  startedAt: 0,
  speechStartAt: 0,
  speechEndAt: 0,
  firstPartialMs: null,
  partialCount: 0,
};

/** Volume nativo (-2 a 10) normalizado em 0..1 para a barra de nivel. */
function toLevel(value: number): number {
  const { min, max } = VOLUME_RANGE;
  if (value <= min) return 0;
  return Math.min(1, (value - min) / (max - min));
}

export function useSpeechTranscription({ onResult }: UseSpeechTranscriptionOptions = {}) {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [partial, setPartial] = useState('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [support, setSupport] = useState<DeviceSpeechSupport | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);

  /** Amplitude do microfone: anima no driver nativo, sem render por amostra. */
  const micLevel = useRef(new Animated.Value(0)).current;

  const timeline = useRef<Timeline>({ ...EMPTY_TIMELINE });
  const supportRef = useRef<DeviceSpeechSupport | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  /** Evita entregar dois resultados para a mesma captura. */
  const resultDelivered = useRef(false);

  /* ---------------- capacidades do aparelho ---------------- */

  const refreshSupport = useCallback(async () => {
    try {
      const next = await readDeviceSupport();
      supportRef.current = next;
      setSupport(next);
    } catch (cause) {
      setError(`Não foi possível ler as capacidades do aparelho: ${String(cause)}`);
    } finally {
      setIsPreparing(false);
    }
  }, []);

  useEffect(() => {
    void refreshSupport();
  }, [refreshSupport]);

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
      firstPartialMs: marks.firstPartialMs,
      finalizeMs: marks.speechEndAt > 0 ? now - marks.speechEndAt : null,
      totalMs: marks.startedAt > 0 ? now - marks.startedAt : null,
      speechMs:
        marks.speechStartAt > 0 && marks.speechEndAt > 0
          ? marks.speechEndAt - marks.speechStartAt
          : null,
      partialCount: marks.partialCount,
    };

    const finished: TranscriptionResult = {
      text,
      metrics,
      finishedAt: now,
      onDevice: supportRef.current?.onDeviceSupported ?? false,
    };

    setPartial('');
    setResult(finished);
    onResultRef.current?.(finished);
  });

  useSpeechRecognitionEvent('nomatch', () => {
    setNotice('O reconhecedor não entendeu nada. Fale mais perto do microfone.');
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    Animated.timing(micLevel, {
      toValue: toLevel(event.value),
      duration: 120,
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

  /* ---------------- controles ---------------- */

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

    const current = supportRef.current;
    if (current && !current.recognitionAvailable) {
      setError('Nenhum serviço de reconhecimento de fala disponível neste aparelho.');
      return;
    }

    setStatus('starting');
    timeline.current.startedAt = Date.now();
    try {
      startTranscription(buildRecognitionOptions(current));
    } catch (cause) {
      setStatus('idle');
      setError(`Não foi possível iniciar a captura: ${String(cause)}`);
    }
  }, []);

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
    status,
    isRecording,
    isPreparing,
    partial,
    result,
    error,
    notice,
    support,
    micLevel,
    start,
    stop,
    reset,
    downloadModel,
    refreshSupport,
  };
}
