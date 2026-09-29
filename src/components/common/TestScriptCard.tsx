import { Pressable, StyleSheet, Text, View } from 'react-native';
import { accuracyLabel } from '@/utils/speechText';
import { formatMs } from '@/utils/transcriptionReport';
import type { TestPhrase, TestPhraseResult, TestVerdict } from '@/types/speech';

/**
 * COMPONENT - roteiro do ticket: uma frase por vez, o que saiu da transcricao e
 * o julgamento de quem esta testando. E daqui que sai o relatorio.
 */
interface TestScriptCardProps {
  phrases: readonly TestPhrase[];
  currentIndex: number;
  currentPhrase: TestPhrase;
  currentResult: TestPhraseResult | null;
  /** Navegacao trava durante a captura: a frase nao pode mudar no meio. */
  disabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onVerdict: (verdict: TestVerdict) => void;
}

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
      hitSlop={8}
      onPress={onPress}
      style={styles.navButton}
    >
      <Text style={disabled ? styles.navLabelDisabled : styles.navLabel}>{label}</Text>
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
  tone: TestVerdict;
  onPress: () => void;
}) {
  const selectedStyle = tone === 'ok' ? styles.verdictOk : styles.verdictAdjust;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.verdict, selected ? selectedStyle : styles.verdictIdle]}
    >
      <Text style={selected ? styles.verdictLabelOn : styles.verdictLabel}>{label}</Text>
    </Pressable>
  );
}

export function TestScriptCard({
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
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          Frase {currentIndex + 1} de {phrases.length}
        </Text>
        <View style={styles.nav}>
          <NavButton
            disabled={disabled || currentIndex === 0}
            label="anterior"
            onPress={onPrevious}
          />
          <NavButton
            disabled={disabled || currentIndex === phrases.length - 1}
            label="próxima"
            onPress={onNext}
          />
        </View>
      </View>

      <View style={styles.expectedBox}>
        <Text style={styles.expectedLabel}>Fale exatamente</Text>
        <Text style={styles.expectedText}>{currentPhrase.expected}</Text>
      </View>

      {currentResult ? (
        <View>
          <Text style={styles.expectedLabel}>Transcrito</Text>
          <Text selectable style={styles.transcript}>
            {currentResult.transcript || '(vazio)'}
          </Text>
          <Text style={styles.summary}>
            acerto de palavras {accuracyLabel(currentResult.wordErrorRate)} · 1º parcial{' '}
            {formatMs(currentResult.metrics.firstPartialMs)} · finalização{' '}
            {formatMs(currentResult.metrics.finalizeMs)}
          </Text>
          <View style={styles.verdicts}>
            <VerdictButton
              label="OK"
              onPress={() => onVerdict('ok')}
              selected={currentResult.verdict === 'ok'}
              tone="ok"
            />
            <VerdictButton
              label="AJUSTAR"
              onPress={() => onVerdict('ajustar')}
              selected={currentResult.verdict === 'ajustar'}
              tone="ajustar"
            />
          </View>
        </View>
      ) : (
        <Text style={styles.pending}>
          Ainda sem resultado para esta frase. Toque em GRAVAR, fale e aguarde o texto.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  expectedBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginVertical: 12,
    padding: 12,
  },
  expectedLabel: {
    color: '#94a3b8',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  expectedText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nav: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  navLabel: {
    color: '#475569',
    fontSize: 12,
  },
  navLabelDisabled: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  pending: {
    color: '#94a3b8',
    fontSize: 12,
  },
  summary: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  transcript: {
    color: '#0f172a',
    fontSize: 16,
    marginTop: 4,
  },
  verdict: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 10,
  },
  verdictAdjust: {
    backgroundColor: '#b45309',
  },
  verdictIdle: {
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  verdictLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  verdictLabelOn: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  verdictOk: {
    backgroundColor: '#059669',
  },
  verdicts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
