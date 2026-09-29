import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * COMPONENT - botao unico da POC: comeca e encerra a captura.
 *
 * Recebe tudo por props. Nao conhece ViewModel, Model nem rota.
 */
interface RecordButtonProps {
  isRecording: boolean;
  disabled?: boolean;
  /** Texto auxiliar abaixo do botao: o estado atual da captura. */
  hint?: string;
  onPress: () => void;
}

export function RecordButton({ isRecording, disabled, hint, onPress }: RecordButtonProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
        accessibilityRole="button"
        accessibilityState={{ busy: isRecording, disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isRecording ? styles.recording : styles.idle,
          disabled ? styles.disabled : null,
          pressed ? styles.pressed : null,
        ]}
      >
        <Text style={styles.label}>{isRecording ? 'PARAR' : 'GRAVAR'}</Text>
      </Pressable>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    backgroundColor: '#cbd5e1',
  },
  hint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  idle: {
    backgroundColor: '#059669',
  },
  label: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  recording: {
    backgroundColor: '#dc2626',
  },
  wrapper: {
    alignItems: 'center',
  },
});
