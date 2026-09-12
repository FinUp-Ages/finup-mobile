/**
 * POC de transcricao de voz — audio para texto, no proprio aparelho.
 *
 * Escopo: capturar a fala, transcrever offline e mostrar o texto. A tela nao
 * interpreta a frase: valor, categoria, estabelecimento e data ficam para outra
 * camada do app.
 *
 * Exige development build — modulo nativo nao roda no Expo Go.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeviceSupportCard } from '@/components/voice/DeviceSupportCard';
import { MicLevelBar } from '@/components/voice/MicLevelBar';
import { RecordButton } from '@/components/voice/RecordButton';
import { ReportCard } from '@/components/voice/ReportCard';
import { TestScriptCard } from '@/components/voice/TestScriptCard';
import { TranscriptCard } from '@/components/voice/TranscriptCard';
import { useSpeechTranscription } from '@/hooks/useSpeechTranscription';
import { useTranscriptionTestRun } from '@/hooks/useTranscriptionTestRun';
import { buildTranscriptionReport } from '@/utils/transcriptionReport';
import type { TranscriptionResult } from '@/types/speech';

type Mode = 'roteiro' | 'livre';

const HINTS: Record<string, string> = {
  idle: 'pronto',
  starting: 'abrindo o microfone...',
  listening: 'pode falar',
  finishing: 'transcrevendo...',
};

export default function TranscricaoScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('roteiro');
  const [airplaneMode, setAirplaneMode] = useState(false);

  const testRun = useTranscriptionTestRun();

  /** O resultado chega de um evento nativo: o modo atual precisa estar em ref. */
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const { record } = testRun;
  const handleResult = useCallback(
    (result: TranscriptionResult) => {
      if (modeRef.current === 'roteiro') record(result);
    },
    [record],
  );

  const speech = useSpeechTranscription({ onResult: handleResult });

  const report = useMemo(
    () =>
      buildTranscriptionReport({
        support: speech.support,
        results: testRun.results,
        platform: `${Platform.OS} ${Platform.Version}`,
        generatedAt: Date.now(),
        airplaneMode,
      }),
    [speech.support, testRun.results, airplaneMode],
  );

  const shareReport = useCallback(() => {
    void Share.share({ message: report });
  }, [report]);

  const toggleRecording = useCallback(() => {
    if (speech.isRecording) speech.stop();
    else void speech.start();
  }, [speech]);

  return (
    <ScrollView
      className="flex-1 bg-slate-100"
      contentContainerStyle={{
        padding: 16,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <Text className="text-2xl font-bold text-slate-900">Transcrição de voz</Text>
        <Text className="text-sm text-slate-600">
          Prova de conceito: a fala vira texto no próprio aparelho, sem enviar áudio para nenhum
          serviço. Interpretar a frase é trabalho de outra camada — aqui é só áudio → texto.
        </Text>
      </View>

      <DeviceSupportCard
        support={speech.support}
        isPreparing={speech.isPreparing}
        onDownloadModel={speech.downloadModel}
      />

      <View className="flex-row gap-2 rounded-2xl bg-white p-1">
        {(['roteiro', 'livre'] as const).map((option) => {
          const selected = mode === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              disabled={speech.isRecording}
              onPress={() => setMode(option)}
              className={[
                'flex-1 items-center rounded-xl py-2 active:opacity-80',
                selected ? 'bg-slate-900' : 'bg-white',
              ].join(' ')}
            >
              <Text
                className={[
                  'text-xs font-bold uppercase tracking-wide',
                  selected ? 'text-white' : 'text-slate-500',
                ].join(' ')}
              >
                {option === 'roteiro' ? 'Roteiro de testes' : 'Fala livre'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === 'roteiro' ? (
        <TestScriptCard
          phrases={testRun.phrases}
          currentIndex={testRun.currentIndex}
          currentPhrase={testRun.currentPhrase}
          currentResult={testRun.currentResult}
          disabled={speech.isRecording}
          onPrevious={testRun.previous}
          onNext={testRun.next}
          onVerdict={(verdict) => testRun.setVerdict(testRun.currentPhrase.id, verdict)}
        />
      ) : null}

      <View className="gap-3">
        <MicLevelBar level={speech.micLevel} active={speech.status === 'listening'} />
        <RecordButton
          isRecording={speech.isRecording}
          hint={HINTS[speech.status]}
          onPress={toggleRecording}
        />
      </View>

      {speech.error ? (
        <View className="rounded-2xl border border-red-200 bg-red-50 p-3">
          <Text className="text-xs text-red-800">{speech.error}</Text>
        </View>
      ) : null}

      {speech.notice ? (
        <View className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <Text className="text-xs text-amber-800">{speech.notice}</Text>
        </View>
      ) : null}

      <TranscriptCard
        status={speech.status}
        partial={speech.partial}
        result={speech.result}
        onClear={speech.reset}
      />

      {mode === 'roteiro' && testRun.results.length > 0 ? (
        <ReportCard
          report={report}
          executed={testRun.results.length}
          total={testRun.phrases.length}
          airplaneMode={airplaneMode}
          onToggleAirplaneMode={() => setAirplaneMode((value) => !value)}
          onShare={shareReport}
          onClear={testRun.clear}
        />
      ) : null}

      <Text className="text-xs text-slate-500">
        Para provar que a transcrição é local, coloque o aparelho em modo avião antes de gravar: com
        o modelo offline instalado, o texto continua aparecendo.
      </Text>
    </ScrollView>
  );
}
