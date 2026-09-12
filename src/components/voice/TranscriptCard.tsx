import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatMs } from '@/utils/transcriptionReport';
import type { TranscriptionResult, TranscriptionStatus } from '@/types/speech';

type TranscriptCardProps = {
  status: TranscriptionStatus;
  /** Hipotese em andamento: some quando o resultado final chega. */
  partial: string;
  result: TranscriptionResult | null;
  onClear: () => void;
};

const STATUS_LABEL: Record<TranscriptionStatus, string> = {
  idle: 'parado',
  starting: 'abrindo o microfone',
  listening: 'ouvindo',
  finishing: 'transcrevendo',
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[72px] flex-1">
      <Text className="text-sm font-semibold text-slate-900">{value}</Text>
      <Text className="text-[10px] uppercase tracking-wide text-slate-500">{label}</Text>
    </View>
  );
}

/** Saida da POC: o texto transcrito e quanto tempo ele levou para aparecer. */
function TranscriptCardImpl({ status, partial, result, onClear }: TranscriptCardProps) {
  const hasText = partial.length > 0 || (result?.text.length ?? 0) > 0;

  return (
    <View className="gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Transcrição · {STATUS_LABEL[status]}
        </Text>
        {hasText ? (
          <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button">
            <Text className="text-xs font-semibold text-slate-500">limpar</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="min-h-[76px] justify-center">
        {result ? (
          <Text className="text-xl leading-7 text-slate-900" selectable>
            {result.text || '(o reconhecedor não devolveu texto)'}
          </Text>
        ) : partial ? (
          <Text className="text-xl leading-7 text-slate-400">{partial}</Text>
        ) : (
          <Text className="text-sm text-slate-400">
            Toque em GRAVAR e diga uma frase curta. O texto aparece aqui — cinza enquanto é
            hipótese, escuro quando o reconhecedor confirma.
          </Text>
        )}
      </View>

      {result ? (
        <View className="flex-row flex-wrap gap-y-3 border-t border-slate-100 pt-3">
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

export const TranscriptCard = memo(TranscriptCardImpl);
