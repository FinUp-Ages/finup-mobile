import { useCallback, useMemo, useState } from 'react';
import { Platform, Share } from 'react-native';
import { ON_DEVICE_SERVICE_PACKAGE, SPEECH_LOCALE } from '@/models/speechRecognitionModel';
import { TEST_PHRASES } from '@/models/transcriptionTestScriptModel';
import { useSpeechCaptureViewModel } from '@/viewmodels/useSpeechCaptureViewModel';
import { wordErrorRate } from '@/utils/speechText';
import { buildTranscriptionReport } from '@/utils/transcriptionReport';
import type { TestPhraseResult, TestVerdict, TranscriptionResult } from '@/types/speech';

/**
 * VIEWMODEL - a tela de transcricao inteira.
 *
 * Junta a captura de voz (useSpeechCaptureViewModel) com o roteiro de testes: em
 * qual frase o operador esta, o que saiu de cada uma, o veredito manual e o
 * relatorio final. A View so observa o que este hook expoe.
 */
export type TranscriptionMode = 'roteiro' | 'livre';

export function useTranscriptionViewModel() {
  const [mode, setMode] = useState<TranscriptionMode>('roteiro');
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<TestPhraseResult[]>([]);

  const goTo = useCallback((next: number) => {
    setCurrentIndex(Math.min(Math.max(next, 0), TEST_PHRASES.length - 1));
  }, []);

  /**
   * Guarda o resultado na frase em foco.
   *
   * Sem ref para o indice: o resultado final chega por um evento nativo, e
   * `useSpeechRecognitionEvent` sempre chama o listener do render mais recente —
   * entao esta closure ja enxerga o indice atual.
   */
  const record = useCallback(
    (result: TranscriptionResult) => {
      const phrase = TEST_PHRASES[currentIndex];
      const entry: TestPhraseResult = {
        expected: phrase.expected,
        finishedAt: result.finishedAt,
        metrics: result.metrics,
        onDevice: result.onDevice,
        phraseId: phrase.id,
        transcript: result.text,
        verdict: null,
        wordErrorRate: wordErrorRate(phrase.expected, result.text),
      };
      // Refazer uma frase substitui o resultado anterior.
      setResults((previous) => [...previous.filter((item) => item.phraseId !== phrase.id), entry]);
    },
    [currentIndex],
  );

  const handleResult = useCallback(
    (result: TranscriptionResult) => {
      if (mode === 'roteiro') record(result);
    },
    [mode, record],
  );

  const capture = useSpeechCaptureViewModel({ onResult: handleResult });

  const setVerdict = useCallback((phraseId: string, verdict: TestVerdict) => {
    setResults((previous) =>
      previous.map((item) =>
        item.phraseId === phraseId
          ? { ...item, verdict: item.verdict === verdict ? null : verdict }
          : item,
      ),
    );
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    goTo(0);
  }, [goTo]);

  const currentPhrase = TEST_PHRASES[currentIndex];
  const currentResult = useMemo(
    () => results.find((item) => item.phraseId === currentPhrase.id) ?? null,
    [results, currentPhrase.id],
  );

  /** Resultados na ordem do roteiro, nao na ordem em que foram gravados. */
  const orderedResults = useMemo(
    () =>
      TEST_PHRASES.map((phrase) => results.find((item) => item.phraseId === phrase.id)).filter(
        (item): item is TestPhraseResult => item !== undefined,
      ),
    [results],
  );

  /**
   * Data do relatorio: o instante do resultado mais recente, nao o do render.
   * `Date.now()` durante o render e impuro — e daria uma data nova a cada
   * re-renderizacao, sem nada ter mudado.
   */
  const generatedAt = useMemo(
    () => orderedResults.reduce((latest, item) => Math.max(latest, item.finishedAt), 0),
    [orderedResults],
  );

  const report = useMemo(
    () =>
      buildTranscriptionReport({
        airplaneMode,
        generatedAt,
        locale: SPEECH_LOCALE,
        phrases: TEST_PHRASES,
        platform: `${Platform.OS} ${Platform.Version}`,
        results: orderedResults,
        support: capture.support,
      }),
    [airplaneMode, generatedAt, orderedResults, capture.support],
  );

  const shareReport = useCallback(() => {
    void Share.share({ message: report });
  }, [report]);

  const toggleRecording = useCallback(() => {
    if (capture.isRecording) capture.stop();
    else void capture.start();
  }, [capture]);

  return {
    airplaneMode,
    capture,
    clearResults,
    currentIndex,
    currentPhrase,
    currentResult,
    goTo,
    // Reexpostos para a View: ela nao pode importar do Model.
    locale: SPEECH_LOCALE,
    mode,
    onDevicePackage: ON_DEVICE_SERVICE_PACKAGE,
    phrases: TEST_PHRASES,
    report,
    results: orderedResults,
    setMode,
    setVerdict,
    shareReport,
    toggleAirplaneMode: () => setAirplaneMode((value) => !value),
    toggleRecording,
  };
}
