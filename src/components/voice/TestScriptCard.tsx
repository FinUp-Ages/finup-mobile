import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { accuracyLabel } from '@/utils/speechText';
import { formatMs } from '@/utils/transcriptionReport';
import type { TestPhrase, TestPhraseResult, TestVerdict } from '@/types/speech';

type TestScriptCardProps = {
  phrases: readonly TestPhrase[];
  currentIndex: number;
  currentPhrase: TestPhrase;
  currentResult: TestPhraseResult | null;
  /** Navegacao trava durante a captura: a frase nao pode mudar no meio. */
  disabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onVerdict: (verdict: TestVerdict) => void;
};

function NavButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className="rounded-lg border border-slate-200 px-3 py-1 active:opacity-70"
    >
      <Text className={disabled ? 'text-xs text-slate-300' : 'text-xs text-slate-600'}>
        {label}
      </Text>
    </Pressable>
  );
}

function VerdictButton({
  label,
  selected,
  tone,
  onPress,
}: {
  label: string;
  selected: boolean;
  tone: 'ok' | 'ajustar';
  onPress: () => void;
}) {
  const selectedClass = tone === 'ok' ? 'bg-emerald-600' : 'bg-amber-600';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={[
        'flex-1 items-center rounded-xl px-3 py-2 active:opacity-80',
        selected ? selectedClass : 'border border-slate-200 bg-white',
      ].join(' ')}
    >
      <Text className={['text-xs font-bold', selected ? 'text-white' : 'text-slate-600'].join(' ')}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Roteiro do ticket: uma frase por vez, o que saiu da transcricao e o julgamento
 * de quem esta testando. E daqui que sai o relatorio.
 */
function TestScriptCardImpl({
  phrases,
  currentIndex,
  currentPhrase,
  currentResult,
  disabled,
  onPrevious,
  onNext,
  onVerdict,
}: TestScriptCardProps) {
  return (
    <View className="gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Frase {currentIndex + 1} de {phrases.length}
        </Text>
        <View className="flex-row gap-2">
          <NavButton
            label="anterior"
            disabled={disabled || currentIndex === 0}
            onPress={onPrevious}
          />
          <NavButton
            label="próxima"
            disabled={disabled || currentIndex === phrases.length - 1}
            onPress={onNext}
          />
        </View>
      </View>

      <View className="rounded-xl bg-slate-50 p-3">
        <Text className="text-[10px] uppercase tracking-wide text-slate-500">Fale exatamente</Text>
        <Text className="pt-1 text-lg font-semibold text-slate-900">{currentPhrase.expected}</Text>
      </View>

      {currentResult ? (
        <View className="gap-2">
          <View>
            <Text className="text-[10px] uppercase tracking-wide text-slate-500">Transcrito</Text>
            <Text className="pt-1 text-base text-slate-900" selectable>
              {currentResult.transcript || '(vazio)'}
            </Text>
          </View>
          <Text className="text-xs text-slate-500">
            acerto de palavras {accuracyLabel(currentResult.wordErrorRate)} · 1º parcial{' '}
            {formatMs(currentResult.metrics.firstPartialMs)} · finalização{' '}
            {formatMs(currentResult.metrics.finalizeMs)}
          </Text>
          <View className="flex-row gap-2 pt-1">
            <VerdictButton
              label="OK"
              tone="ok"
              selected={currentResult.verdict === 'ok'}
              onPress={() => onVerdict('ok')}
            />
            <VerdictButton
              label="AJUSTAR"
              tone="ajustar"
              selected={currentResult.verdict === 'ajustar'}
              onPress={() => onVerdict('ajustar')}
            />
          </View>
        </View>
      ) : (
        <Text className="text-xs text-slate-400">
          Ainda sem resultado para esta frase. Toque em GRAVAR, fale e aguarde o texto.
        </Text>
      )}
    </View>
  );
}

export const TestScriptCard = memo(TestScriptCardImpl);
