import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * COMPONENT - relatorio em Markdown do roteiro. Sai do aparelho pelo
 * compartilhamento do sistema e entra direto no documento da POC.
 */
interface TranscriptionReportCardProps {
  report: string;
  /** Quantas frases do roteiro ja tem resultado. */
  executed: number;
  total: number;
  airplaneMode: boolean;
  onToggleAirplaneMode: () => void;
  onShare: () => void;
  onClear: () => void;
}

/** A tabela do relatorio so fica legivel com largura fixa por caractere. */
const MONOSPACE = Platform.select({ default: 'monospace', ios: 'Menlo' });

export function TranscriptionReportCard({
  report,
  executed,
  total,
  airplaneMode,
  onToggleAirplaneMode,
  onShare,
  onClear,
}: TranscriptionReportCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          Relatório · {executed} de {total}
        </Text>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onClear}>
          <Text style={styles.clear}>zerar</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: airplaneMode }}
        onPress={onToggleAirplaneMode}
        style={styles.checkboxRow}
      >
        <View style={[styles.checkbox, airplaneMode ? styles.checkboxOn : styles.checkboxOff]}>
          {airplaneMode ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <Text style={styles.checkboxLabel}>Testei com o aparelho em modo avião</Text>
      </Pressable>

      <ScrollView horizontal contentContainerStyle={styles.reportContent} style={styles.report}>
        <Text selectable style={[styles.reportText, { fontFamily: MONOSPACE }]}>
          {report}
        </Text>
      </ScrollView>

      <Pressable accessibilityRole="button" onPress={onShare} style={styles.share}>
        <Text style={styles.shareLabel}>Compartilhar relatório</Text>
      </Pressable>
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
  checkbox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxLabel: {
    color: '#475569',
    fontSize: 12,
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxOff: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  checkboxOn: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  clear: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
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
  report: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    maxHeight: 220,
  },
  reportContent: {
    padding: 12,
  },
  reportText: {
    color: '#e2e8f0',
    fontSize: 10,
    lineHeight: 16,
  },
  share: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    marginTop: 12,
    paddingVertical: 12,
  },
  shareLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
