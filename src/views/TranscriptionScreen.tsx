import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DeviceSupportCard } from '@/components/common/DeviceSupportCard';
import { MicLevelBar } from '@/components/common/MicLevelBar';
import { RecordButton } from '@/components/common/RecordButton';
import { TestScriptCard } from '@/components/common/TestScriptCard';
import { TranscriptCard } from '@/components/common/TranscriptCard';
import { TranscriptionReportCard } from '@/components/common/TranscriptionReportCard';
import { useTranscriptionViewModel } from '@/viewmodels/useTranscriptionViewModel';
import type { TranscriptionStatus } from '@/types/speech';

/**
 * VIEW - POC de transcricao de voz: audio vira texto no proprio aparelho.
 *
 * Observa o useTranscriptionViewModel e distribui o dado para os componentes.
 * Nao importa Model, nao conhece o modulo nativo, nao tem regra de negocio.
 *
 * Escopo da POC: audio -> texto. A tela nao interpreta a frase; valor,
 * categoria, estabelecimento e data ficam para outra camada do app.
 *
 * A rota que aponta para esta tela e app/(tabs)/transcricao.tsx.
 */
const HINTS: Record<TranscriptionStatus, string> = {
  finishing: 'transcrevendo...',
  idle: 'pronto',
  listening: 'pode falar',
  starting: 'abrindo o microfone...',
};

const MODES = [
  { label: 'Roteiro de testes', value: 'roteiro' },
  { label: 'Fala livre', value: 'livre' },
] as const;

export default function TranscriptionScreen() {
  const vm = useTranscriptionViewModel();
  const { capture } = vm;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text style={styles.heading}>Transcrição de voz</Text>
      <Text style={styles.subtitle}>
        Prova de conceito: a fala vira texto no próprio aparelho, sem enviar áudio para nenhum
        serviço. Interpretar a frase é trabalho de outra camada — aqui é só áudio → texto.
      </Text>

      <View style={styles.block}>
        <DeviceSupportCard
          loading={capture.loadingSupport}
          locale={vm.locale}
          onDevicePackage={vm.onDevicePackage}
          onDownloadModel={capture.downloadModel}
          support={capture.support}
        />
      </View>

      <View style={[styles.block, styles.modes]}>
        {MODES.map((option) => {
          const selected = vm.mode === option.value;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              disabled={capture.isRecording}
              key={option.value}
              onPress={() => vm.setMode(option.value)}
              style={[styles.mode, selected ? styles.modeOn : null]}
            >
              <Text style={selected ? styles.modeLabelOn : styles.modeLabel}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {vm.mode === 'roteiro' ? (
        <View style={styles.block}>
          <TestScriptCard
            currentIndex={vm.currentIndex}
            currentPhrase={vm.currentPhrase}
            currentResult={vm.currentResult}
            disabled={capture.isRecording}
            onNext={() => vm.goTo(vm.currentIndex + 1)}
            onPrevious={() => vm.goTo(vm.currentIndex - 1)}
            onVerdict={(verdict) => vm.setVerdict(vm.currentPhrase.id, verdict)}
            phrases={vm.phrases}
          />
        </View>
      ) : null}

      <View style={styles.block}>
        <MicLevelBar active={capture.status === 'listening'} level={capture.micLevel} />
      </View>

      <View style={styles.block}>
        <RecordButton
          hint={HINTS[capture.status]}
          isRecording={capture.isRecording}
          onPress={vm.toggleRecording}
        />
      </View>

      {capture.error ? (
        <View style={[styles.block, styles.errorBox]}>
          <Text style={styles.errorText}>{capture.error}</Text>
        </View>
      ) : null}

      {capture.notice ? (
        <View style={[styles.block, styles.noticeBox]}>
          <Text style={styles.noticeText}>{capture.notice}</Text>
        </View>
      ) : null}

      <View style={styles.block}>
        <TranscriptCard
          onClear={capture.reset}
          partial={capture.partial}
          result={capture.result}
          status={capture.status}
        />
      </View>

      {vm.mode === 'roteiro' && vm.results.length > 0 ? (
        <View style={styles.block}>
          <TranscriptionReportCard
            airplaneMode={vm.airplaneMode}
            executed={vm.results.length}
            onClear={vm.clearResults}
            onShare={vm.shareReport}
            onToggleAirplaneMode={vm.toggleAirplaneMode}
            report={vm.report}
            total={vm.phrases.length}
          />
        </View>
      ) : null}

      <Text style={styles.footnote}>
        Para provar que a transcrição é local, coloque o aparelho em modo avião antes de gravar: com
        o modelo offline instalado, o texto continua aparecendo.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 16,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
  },
  footnote: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 16,
  },
  heading: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '600',
  },
  mode: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 10,
  },
  modeLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modeLabelOn: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modeOn: {
    backgroundColor: '#0f172a',
  },
  modes: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 4,
  },
  noticeBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  noticeText: {
    color: '#92400e',
    fontSize: 12,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
});
