import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - botao em pilula da aba Transacao e do modal de transacao
 * (mockup: "Entrada"/"Saida" e "Salvar entrada"/"Salvar saida").
 *
 * Passivo: rotulo, icone e estado chegam por props. `light` e o botao claro
 * (entrada), `dark` o escuro (saida).
 */
type PillButtonProps = {
  label: string;
  onPress: () => void;
  variant: 'light' | 'dark';
  icon: 'plus' | 'minus';
  disabled?: boolean;
  loading?: boolean;
};

export function PillButton({ label, onPress, variant, icon, disabled, loading }: PillButtonProps) {
  const isLight = variant === 'light';
  const isNonInteractive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isNonInteractive), busy: Boolean(loading) }}
      disabled={isNonInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isLight ? styles.buttonLight : styles.buttonDark,
        disabled ? styles.buttonDisabled : null,
        pressed && !isNonInteractive ? styles.buttonPressed : null,
      ]}
    >
      <Text style={[styles.label, isLight ? styles.labelLight : styles.labelDark]}>{label}</Text>
      {loading ? (
        <ActivityIndicator
          color={isLight ? colors.pillLightText : colors.pillSoftText}
          size="small"
        />
      ) : (
        <View style={[styles.iconCircle, isLight ? styles.iconCircleLight : styles.iconCircleDark]}>
          <Feather color={isLight ? colors.white : colors.pillLightText} name={icon} size={14} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10000,
    flexDirection: 'row',
    height: 55,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  buttonDark: {
    backgroundColor: colors.pillSoftFill,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonLight: {
    backgroundColor: '#f5f5f5',
  },
  // Feedback no toque (press-in), como pede o guia da Expo: escala leve no lugar
  // de ripple, igual nas duas plataformas.
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  iconCircleDark: {
    backgroundColor: colors.pillSoftText,
  },
  iconCircleLight: {
    backgroundColor: colors.pillLightText,
  },
  label: {
    fontSize: 16,
  },
  labelDark: {
    color: colors.pillSoftText,
  },
  labelLight: {
    color: colors.pillLightText,
  },
});
