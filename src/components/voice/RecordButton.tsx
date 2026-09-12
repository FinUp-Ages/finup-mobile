import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

type RecordButtonProps = {
  isRecording: boolean;
  disabled?: boolean;
  /** Texto auxiliar abaixo do rotulo (ex.: estado atual da captura). */
  hint?: string;
  onPress: () => void;
};

/** Botao unico da POC: comeca e encerra a captura. */
function RecordButtonImpl({ isRecording, disabled, hint, onPress }: RecordButtonProps) {
  return (
    <View className="items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
        accessibilityState={{ disabled: !!disabled, busy: isRecording }}
        disabled={disabled}
        onPress={onPress}
        className={[
          'h-16 w-full items-center justify-center rounded-2xl active:opacity-80',
          disabled ? 'bg-slate-300' : isRecording ? 'bg-red-600' : 'bg-emerald-600',
        ].join(' ')}
      >
        <Text className="text-lg font-bold tracking-wide text-white">
          {isRecording ? 'PARAR' : 'GRAVAR'}
        </Text>
      </Pressable>
      {hint ? <Text className="text-xs text-slate-500">{hint}</Text> : null}
    </View>
  );
}

export const RecordButton = memo(RecordButtonImpl);
