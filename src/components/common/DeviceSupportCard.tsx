import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DeviceSpeechSupport } from '@/types/speech';

/**
 * COMPONENT - responde a pergunta central da POC antes de qualquer gravacao:
 * este aparelho transcreve sem internet?
 */
interface DeviceSupportCardProps {
  support: DeviceSpeechSupport | null;
  loading: boolean;
  /** Pacote de reconhecimento no aparelho que a POC prefere. */
  onDevicePackage: string;
  locale: string;
  onDownloadModel: () => void;
}

function Line({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text
        style={[
          styles.lineValue,
          ok === undefined ? styles.neutral : ok ? styles.good : styles.warn,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function DeviceSupportCard({
  support,
  loading,
  onDevicePackage,
  locale,
  onDownloadModel,
}: DeviceSupportCardProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.muted}>Lendo as capacidades do aparelho...</Text>
      </View>
    );
  }

  if (!support) {
    return (
      <View style={styles.noticeCard}>
        <Text style={styles.noticeText}>
          Não foi possível ler as capacidades do aparelho. No Expo Go isso é esperado: o
          reconhecimento é um módulo nativo e exige build de desenvolvimento.
        </Text>
      </View>
    );
  }

  const offlineReady = support.onDeviceSupported && support.hasOfflineLocale;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Aparelho</Text>
        <View style={[styles.badge, offlineReady ? styles.badgeGood : styles.badgeWarn]}>
          <Text style={[styles.badgeText, offlineReady ? styles.good : styles.warn]}>
            {offlineReady ? 'offline pronto' : 'offline não confirmado'}
          </Text>
        </View>
      </View>

      <Line
        label="Reconhecimento no aparelho"
        ok={support.onDeviceSupported}
        value={support.onDeviceSupported ? 'suportado' : 'não suportado'}
      />
      <Line
        label="Serviço de reconhecimento"
        ok={support.recognitionAvailable}
        value={support.recognitionAvailable ? 'disponível' : 'indisponível'}
      />
      <Line
        label={onDevicePackage}
        ok={support.hasOnDevicePackage}
        value={support.hasOnDevicePackage ? 'instalado' : 'ausente'}
      />
      <Line
        label={`Modelo offline ${locale}`}
        ok={support.hasOfflineLocale}
        value={support.hasOfflineLocale ? 'instalado' : 'não confirmado'}
      />
      <Line label="Serviço padrão" value={support.defaultService || '—'} />
      <Line label="Serviços instalados" value={support.services.join(', ') || '—'} />

      {support.hasOfflineLocale ? null : (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onDownloadModel}>
          <Text style={styles.action}>Baixar modelo offline de {locale}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeGood: {
    backgroundColor: '#d1fae5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeWarn: {
    backgroundColor: '#fef3c7',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  good: {
    color: '#047857',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heading: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  lineLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  lineValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  muted: {
    color: '#64748b',
    fontSize: 12,
  },
  neutral: {
    color: '#334155',
  },
  noticeCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  noticeText: {
    color: '#92400e',
    fontSize: 12,
  },
  warn: {
    color: '#b45309',
  },
});
