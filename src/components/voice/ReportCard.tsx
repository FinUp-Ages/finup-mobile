import { memo } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

/** A tabela do relatorio so fica legivel com largura fixa por caractere. */
const MONOSPACE = { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) };

type ReportCardProps = {
  report: string;
  /** Quantas frases do roteiro ja tem resultado. */
  executed: number;
  total: number;
  airplaneMode: boolean;
  onToggleAirplaneMode: () => void;
  onShare: () => void;
  onClear: () => void;
};

/**
 * Relatorio em Markdown do roteiro. Sai do aparelho pelo compartilhamento do
 * sistema e entra direto no documento da POC.
 */
function ReportCardImpl({
  report,
  executed,
  total,
  airplaneMode,
  onToggleAirplaneMode,
  onShare,
  onClear,
}: ReportCardProps) {
  return (
    <View className="gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Relatório · {executed} de {total}
        </Text>
        <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button">
          <Text className="text-xs font-semibold text-slate-500">zerar</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: airplaneMode }}
        onPress={onToggleAirplaneMode}
        className="flex-row items-center gap-2 active:opacity-70"
      >
        <View
          className={[
            'h-5 w-5 items-center justify-center rounded border',
            airplaneMode ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white',
          ].join(' ')}
        >
          {airplaneMode ? <Text className="text-xs font-bold text-white">✓</Text> : null}
        </View>
        <Text className="text-xs text-slate-600">Testei com o aparelho em modo avião</Text>
      </Pressable>

      <ScrollView
        horizontal
        className="max-h-56 rounded-xl bg-slate-900"
        contentContainerStyle={{ padding: 12 }}
      >
        <Text className="text-[10px] leading-4 text-slate-100" style={MONOSPACE} selectable>
          {report}
        </Text>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={onShare}
        className="items-center rounded-xl bg-slate-900 px-4 py-3 active:opacity-80"
      >
        <Text className="text-xs font-bold uppercase tracking-wide text-white">
          Compartilhar relatório
        </Text>
      </Pressable>
    </View>
  );
}

export const ReportCard = memo(ReportCardImpl);
