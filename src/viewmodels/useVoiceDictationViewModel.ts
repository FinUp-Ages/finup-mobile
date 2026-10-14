import { useCallback, useEffect, useRef, useState } from 'react';
import {
  abortTranscription,
  buildDictationOptions,
  isSpeechRecognitionAvailable,
  requestSpeechPermission,
  startTranscription,
  stopTranscription,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from '@/models/speechRecognitionModel';

/**
 * VIEWMODEL - ditado por voz: transforma uma fala curta em texto e entrega para
 * quem estiver editando um rascunho. Nao envia nada; o envio continua manual.
 *
 * Os eventos do reconhecedor sao globais: qualquer tela montada que use o
 * reconhecedor (como a POC de transcricao, aberta por cima do chat) recebe os
 * mesmos eventos. Este hook so reage as sessoes que ele mesmo iniciou
 * (`ownsSession`).
 */
type DictationStatus = 'idle' | 'starting' | 'listening';

interface UseVoiceDictationOptions {
  /** Texto final de uma captura concluida, ja sem espacos nas pontas. */
  onTranscript: (text: string) => void;
}

const NO_SPEECH_MESSAGE = 'Não captei nenhuma fala. Toque no microfone e tente de novo.';

function createErrorMessage(code: ExpoSpeechRecognitionErrorCode): string {
  switch (code) {
    case 'no-speech':
    case 'speech-timeout':
      return NO_SPEECH_MESSAGE;
    case 'not-allowed':
      return 'Permita o acesso ao microfone nas configurações do aparelho para ditar mensagens.';
    case 'audio-capture':
      return 'Não foi possível usar o microfone. Outro app pode estar usando o áudio.';
    case 'network':
      return 'O ditado precisa de conexão neste aparelho. Verifique sua internet e tente de novo.';
    case 'language-not-supported':
      return 'O ditado em português não está disponível neste aparelho.';
    case 'service-not-allowed':
      return 'Nenhum serviço de reconhecimento de fala está habilitado neste aparelho.';
    case 'interrupted':
      return 'O ditado foi interrompido por outro áudio do aparelho. Tente de novo.';
    case 'busy':
      return 'O reconhecimento de fala está ocupado. Aguarde um instante e tente de novo.';
    default:
      return 'Não foi possível transcrever sua fala. Tente de novo ou digite a mensagem.';
  }
}

export function useVoiceDictationViewModel({ onTranscript }: UseVoiceDictationOptions) {
  const [status, setStatus] = useState<DictationStatus>('idle');
  const [partial, setPartial] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  /** Marcadores da sessao em andamento: so lidos e escritos em handlers. */
  const ownsSession = useRef(false);
  const cancelledBeforeStart = useRef(false);
  const discarded = useRef(false);
  const delivered = useRef(false);
  const failed = useRef(false);
  const lastPartial = useRef('');

  /* ---------------- eventos do reconhecedor ---------------- */

  useSpeechRecognitionEvent('start', () => {
    if (ownsSession.current) setStatus('listening');
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (!ownsSession.current || discarded.current) return;
    const text = event.results[0]?.transcript.trim() ?? '';

    if (!event.isFinal) {
      lastPartial.current = text;
      setPartial(text);
      return;
    }

    lastPartial.current = '';
    setPartial('');
    if (!text || delivered.current) return;
    delivered.current = true;
    onTranscript(text);
  });

  useSpeechRecognitionEvent('nomatch', () => {
    if (!ownsSession.current || discarded.current) return;
    failed.current = true;
    setMessage(NO_SPEECH_MESSAGE);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (!ownsSession.current || discarded.current || event.error === 'aborted') return;
    failed.current = true;
    setMessage(createErrorMessage(event.error));
  });

  // Sempre o ultimo evento da sessao, inclusive depois de erro ou abort().
  useSpeechRecognitionEvent('end', () => {
    if (!ownsSession.current) return;

    if (!discarded.current && !delivered.current) {
      // Soltar o microfone cedo pode encerrar sem resultado final: o parcial que
      // o usuario ja viu no campo nao deve sumir.
      if (lastPartial.current) {
        onTranscript(lastPartial.current);
      } else if (!failed.current) {
        setMessage(NO_SPEECH_MESSAGE);
      }
    }

    ownsSession.current = false;
    lastPartial.current = '';
    setPartial('');
    setStatus('idle');
  });

  /* ---------------- acoes ---------------- */

  const start = useCallback(async () => {
    if (ownsSession.current) return;
    setMessage(null);

    if (!isSpeechRecognitionAvailable()) {
      setMessage('O ditado por voz não está disponível nesta versão do app.');
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
      setMessage('Permita o acesso ao microfone nas configurações do aparelho para ditar mensagens.');
      return;
    }

    // Soltar o dedo (ou cancelar) enquanto o dialogo de permissao estava aberto.
    if (cancelledBeforeStart.current) {
      setStatus('idle');
      return;
    }

    ownsSession.current = true;
    discarded.current = false;
    delivered.current = false;
    failed.current = false;
    lastPartial.current = '';

    try {
      startTranscription(buildDictationOptions());
    } catch {
      ownsSession.current = false;
      setStatus('idle');
      setMessage('Não foi possível iniciar o ditado. Tente de novo.');
    }
  }, []);

  /** Encerra a fala e entrega o que foi transcrito. */
  const stop = useCallback(() => {
    if (!ownsSession.current) {
      cancelledBeforeStart.current = true;
      return;
    }
    stopTranscription();
  }, []);

  /** Descarta a fala em andamento; o rascunho anterior fica como estava. */
  const cancel = useCallback(() => {
    if (!ownsSession.current) {
      cancelledBeforeStart.current = true;
      return;
    }
    discarded.current = true;
    setPartial('');
    abortTranscription();
  }, []);

  const dismissMessage = useCallback(() => setMessage(null), []);

  /** Sair da tela no meio do ditado deixaria o microfone aberto. */
  useEffect(
    () => () => {
      if (ownsSession.current) abortTranscription();
    },
    [],
  );

  return {
    cancel,
    dismissMessage,
    isListening: status !== 'idle',
    message,
    partial,
    start,
    stop,
  };
}
