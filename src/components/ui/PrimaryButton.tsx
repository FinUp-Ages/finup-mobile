import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - botao de acao principal (Proximo / Salvar).
 *
 * Passivo: recebe rotulo, icone e estado por props. Nao sabe se esta na Etapa 1,
 * 2 ou 3, nem o que a acao faz.
 */
type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: 'next' | 'save';
};

export function PrimaryButton({ label, onPress, disabled, loading, icon }: PrimaryButtonProps) {
  const isNonInteractive = disabled || loading;

  return (
    <Pressable
      disabled={isNonInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.buttonDisabled : null,
        pressed && !isNonInteractive ? styles.buttonPressed : null,
      ]}
    >
      <Text style={[styles.label, disabled ? styles.labelDisabled : null]}>{label}</Text>
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : icon ? (
        <View style={[styles.iconCircle, disabled ? styles.iconCircleDisabled : null]}>
          <Text style={[styles.iconText, disabled ? styles.iconTextDisabled : null]}>
            {icon === 'save' ? '✓' : '→'}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.track,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  iconCircleDisabled: {
    backgroundColor: colors.disabledIcon,
  },
  iconText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  iconTextDisabled: {
    color: colors.placeholder,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  labelDisabled: {
    color: colors.placeholder,
  },
});
