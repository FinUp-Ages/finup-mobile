import { useCallback, useEffect, useRef, useState } from 'react';
import {
  abortTranscription,
  buildDictationOptions,
  isSpeechRecognitionAvailable,
  normalizeVolume,
  requestSpeechPermission,
  startTranscription,
  stopTranscription,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from '@/models/speechRecognitionModel';
import type { VoiceRecording, VoiceStatus } from '@/types/chatbot';

/**
 * VIEWMODEL - mensagem de voz: grava enquanto o microfone esta pressionado e,
 * ao soltar, entrega o texto transcrito e a forma de onda da gravacao para quem
 * envia. A transcricao acontece durante a fala, mas nao e mostrada: a mensagem
 * enviada anima a forma de onda virando o texto.
 *
 * Os eventos do reconhecedor sao globais: qualquer tela montada que use o
 * reconhecedor (como a POC de transcricao, aberta por cima do chat) recebe os
 * mesmos eventos. Este hook so reage as sessoes que ele mesmo iniciou
 * (`ownsSession`).
 */
interface UseVoiceDictationOptions {
  /** Gravacao concluida com fala: texto ja sem espacos nas pontas. */
  onRecorded: (text: string, recording: VoiceRecording) => void;
}

/** Barras da forma de onda guardadas para a animacao da mensagem. */
const WAVEFORM_BARS = 28;
/** Altura minima de cada barra, para o balao nunca ficar sem forma de onda. */
const WAVEFORM_FLOOR = 0.15;

const NO_SPEECH_MESSAGE = 'Não captei nenhuma fala. Segure o microfone enquanto fala.';

function createErrorMessage(code: ExpoSpeechRecognitionErrorCode): string {
  switch (code) {
    case 'not-allowed':
      return 'Permita o acesso ao microfone nas configurações do aparelho para enviar áudios.';
    case 'audio-capture':
      return 'Não foi possível usar o microfone. Outro app pode estar usando o áudio.';
    case 'network':
      return 'O áudio precisa de conexão neste aparelho. Verifique sua internet e tente de novo.';
    case 'language-not-supported':
      return 'O reconhecimento de fala em português não está disponível neste aparelho.';
    case 'service-not-allowed':
      return 'Nenhum serviço de reconhecimento de fala está habilitado neste aparelho.';
    case 'interrupted':
      return 'A gravação foi interrompida por outro áudio do aparelho. Tente de novo.';
    case 'busy':
      return 'O reconhecimento de fala está ocupado. Aguarde um instante e tente de novo.';
    default:
      return 'Não foi possível entender o áudio. Tente de novo ou digite a mensagem.';
  }
}

/**
 * Reduz as amostras de volume da gravacao a `WAVEFORM_BARS` barras, relativas
 * ao pico: uma fala baixa ainda desenha o contorno dela.
 */
function toWaveform(samples: number[]): number[] {
  const peak = Math.max(0, ...samples);
  return Array.from({ length: WAVEFORM_BARS }, (_, bar) => {
    const from = Math.floor((bar * samples.length) / WAVEFORM_BARS);
    const to = Math.max(from + 1, Math.floor(((bar + 1) * samples.length) / WAVEFORM_BARS));
    const level = peak > 0 ? Math.max(0, ...samples.slice(from, to)) / peak : 0;
    return WAVEFORM_FLOOR + (1 - WAVEFORM_FLOOR) * level;
  });
}

export function useVoiceDictationViewModel({ onRecorded }: UseVoiceDictationOptions) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  /** Inicio da gravacao (epoch ms), para o cronometro do composer. */
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);

  /** Marcadores da sessao em andamento: so lidos e escritos em handlers. */
  const ownsSession = useRef(false);
  const cancelledBeforeStart = useRef(false);
  const discarded = useRef(false);
  const failed = useRef(false);
  /** No modo continuo, cada trecho da fala chega como um resultado final. */
  const finalSegments = useRef<string[]>([]);
  const lastPartial = useRef('');
  const volumeSamples = useRef<number[]>([]);

  /* ---------------- eventos do reconhecedor ---------------- */

  useSpeechRecognitionEvent('start', () => {
    if (!ownsSession.current) return;
    setRecordingStartedAt(Date.now());
    // Soltar o dedo antes de o reconhecedor confirmar o inicio ja pediu o stop().
    setStatus((current) => (current === 'processing' ? current : 'recording'));
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    if (ownsSession.current && !discarded.current) volumeSamples.current.push(normalizeVolume(event.value));
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (!ownsSession.current || discarded.current) return;
    const text = event.results[0]?.transcript.trim() ?? '';

    if (!event.isFinal) {
      lastPartial.current = text;
      return;
    }

    lastPartial.current = '';
    if (text) finalSegments.current.push(text);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (!ownsSession.current || discarded.current) return;
    // Sem fala nao e falha: o `end` decide entre enviar o que ja foi captado e
    // avisar que nada foi ouvido.
    if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'speech-timeout') return;
    failed.current = true;
    setMessage(createErrorMessage(event.error));
  });

  // Sempre o ultimo evento da sessao, inclusive depois de erro ou abort().
  useSpeechRecognitionEvent('end', () => {
    if (!ownsSession.current) return;

    if (!discarded.current && !failed.current) {
      // Soltar o microfone logo depois de falar pode encerrar sem o resultado
      // final do ultimo trecho: o parcial dele ainda vale.
      const text = [...finalSegments.current, lastPartial.current].filter(Boolean).join(' ').trim();
      if (text) {
        onRecorded(text, { levels: toWaveform(volumeSamples.current) });
      } else {
        setMessage(NO_SPEECH_MESSAGE);
      }
    }

    ownsSession.current = false;
    finalSegments.current = [];
    lastPartial.current = '';
    volumeSamples.current = [];
    setRecordingStartedAt(null);
    setStatus('idle');
  });

  /* ---------------- acoes ---------------- */

  const start = useCallback(async () => {
    if (ownsSession.current) return;
    setMessage(null);

    if (!isSpeechRecognitionAvailable()) {
      setMessage('O envio de áudio não está disponível nesta versão do app.');
      return;
    }

    cancelledBeforeStart.current = false;
    setStatus('starting');

    let granted = false;
    try {
      granted = await requestSpeechPermission();
    } catch {
      granted = false;
    }

    if (!granted) {
      setStatus('idle');
      setMessage('Permita o acesso ao microfone nas configurações do aparelho para enviar áudios.');
      return;
    }

    // Soltar o dedo (ou o dialogo de permissao interromper o gesto) antes de a
    // gravacao comecar: nada a gravar.
    if (cancelledBeforeStart.current) {
      setStatus('idle');
      return;
    }

    ownsSession.current = true;
    discarded.current = false;
    failed.current = false;
    finalSegments.current = [];
    lastPartial.current = '';
    volumeSamples.current = [];

    try {
      startTranscription(buildDictationOptions());
    } catch {
      ownsSession.current = false;
      setStatus('idle');
      setMessage('Não foi possível iniciar a gravação. Tente de novo.');
    }
  }, []);

  /** Soltou o microfone: encerra a gravacao e envia o que foi transcrito. */
  const stop = useCallback(() => {
    if (!ownsSession.current) {
      cancelledBeforeStart.current = true;
      return;
    }
    setStatus('processing');
    stopTranscription();
  }, []);

  /** Descarta a gravacao em andamento sem enviar nada. */
  const cancel = useCallback(() => {
    if (!ownsSession.current) {
      cancelledBeforeStart.current = true;
      return;
    }
    discarded.current = true;
    abortTranscription();
  }, []);

  const dismissMessage = useCallback(() => setMessage(null), []);

  /** Sair da tela no meio da gravacao deixaria o microfone aberto. */
  useEffect(
    () => () => {
      if (ownsSession.current) {
        discarded.current = true;
        abortTranscription();
      }
    },
    [],
  );

  return {
    cancel,
    dismissMessage,
    isActive: status !== 'idle',
    message,
    recordingStartedAt,
    start,
    status,
    stop,
  };
}
