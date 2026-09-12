/**
 * Roteiro de testes da POC: as frases do ticket, uma por vez, com o resultado
 * de cada uma guardado para virar relatorio.
 *
 * A comparacao com a frase esperada e so contagem de palavras (WER). Nenhuma
 * leitura de valor, categoria ou data acontece aqui.
 */
import { useCallback, useMemo, useRef, useState } from 'react';

import { TEST_PHRASES } from '@/constants/speech';
import { wordErrorRate } from '@/utils/speechText';
import type { TestPhraseResult, TestVerdict, TranscriptionResult } from '@/types/speech';

export function useTranscriptionTestRun() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<TestPhraseResult[]>([]);

  /** O resultado final chega de um evento nativo: o indice precisa estar em ref. */
  const indexRef = useRef(0);
  const setIndex = useCallback((next: number) => {
    const clamped = Math.min(Math.max(next, 0), TEST_PHRASES.length - 1);
    indexRef.current = clamped;
    setCurrentIndex(clamped);
  }, []);

  /** Guarda o resultado na frase que estava em foco quando a captura comecou. */
  const record = useCallback((result: TranscriptionResult) => {
    const phrase = TEST_PHRASES[indexRef.current];
    const entry: TestPhraseResult = {
      phraseId: phrase.id,
      expected: phrase.expected,
      transcript: result.text,
      metrics: result.metrics,
      wordErrorRate: wordErrorRate(phrase.expected, result.text),
      verdict: null,
      onDevice: result.onDevice,
      finishedAt: result.finishedAt,
    };
    // Refazer uma frase substitui o resultado anterior.
    setResults((previous) => [...previous.filter((item) => item.phraseId !== phrase.id), entry]);
  }, []);

  const setVerdict = useCallback((phraseId: string, verdict: TestVerdict) => {
    setResults((previous) =>
      previous.map((item) =>
        item.phraseId === phraseId
          ? { ...item, verdict: item.verdict === verdict ? null : verdict }
          : item,
      ),
    );
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setIndex(0);
  }, [setIndex]);

  const next = useCallback(() => setIndex(indexRef.current + 1), [setIndex]);
  const previous = useCallback(() => setIndex(indexRef.current - 1), [setIndex]);

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

  return {
    phrases: TEST_PHRASES,
    currentIndex,
    currentPhrase,
    currentResult,
    results: orderedResults,
    record,
    setVerdict,
    next,
    previous,
    goTo: setIndex,
    clear,
  };
}
