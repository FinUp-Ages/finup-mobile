import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMs } from '@/utils/transcriptionReport';
import type { TranscriptionResult, TranscriptionStatus } from '@/types/speech';

/**
 * COMPONENT - saida da POC: o texto transcrito e quanto tempo ele levou.
 */
interface TranscriptCardProps {
  status: TranscriptionStatus;
  /** Hipotese em andamento: some quando o resultado final chega. */
  partial: string;
  result: TranscriptionResult | null;
  onClear: () => void;
}

const STATUS_LABEL: Record<TranscriptionStatus, string> = {
  finishing: 'transcrevendo',
  idle: 'parado',
  listening: 'ouvindo',
  starting: 'abrindo o microfone',
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function TranscriptCard({ status, partial, result, onClear }: TranscriptCardProps) {
  const hasText = partial.length > 0 || (result?.text.length ?? 0) > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Transcrição · {STATUS_LABEL[status]}</Text>
        {hasText ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onClear}>
            <Text style={styles.clear}>limpar</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.textArea}>
        {result ? (
          <Text selectable style={styles.finalText}>
            {result.text || '(o reconhecedor não devolveu texto)'}
          </Text>
        ) : partial ? (
          <Text style={styles.partialText}>{partial}</Text>
        ) : (
          <Text style={styles.placeholder}>
            Toque em GRAVAR e diga uma frase curta. O texto aparece aqui — cinza enquanto é
            hipótese, escuro quando o reconhecedor confirma.
          </Text>
        )}
      </View>

      {result ? (
        <View style={styles.metrics}>
          <Metric label="1º parcial" value={formatMs(result.metrics.firstPartialMs)} />
          <Metric label="finalização" value={formatMs(result.metrics.finalizeMs)} />
          <Metric label="total" value={formatMs(result.metrics.totalMs)} />
          <Metric label="fala" value={formatMs(result.metrics.speechMs)} />
          <Metric label="parciais" value={String(result.metrics.partialCount)} />
          <Metric label="no aparelho" value={result.onDevice ? 'sim' : 'não'} />
        </View>
      ) : null}
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
  clear: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  finalText: {
    color: '#0f172a',
    fontSize: 20,
    lineHeight: 28,
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
  metric: {
    flexBasis: '33%',
    marginTop: 12,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  metrics: {
    borderTopColor: '#f1f5f9',
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  partialText: {
    color: '#94a3b8',
    fontSize: 20,
    lineHeight: 28,
  },
  placeholder: {
    color: '#94a3b8',
    fontSize: 13,
  },
  textArea: {
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 76,
  },
});
