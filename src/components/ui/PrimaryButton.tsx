import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: 'next' | 'save' | boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading, icon }: PrimaryButtonProps) {
  const isNonInteractive = disabled || loading;
  const showIcon = icon === 'next' || icon === true;

  return (
    <Pressable
      disabled={isNonInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        !showIcon ? styles.buttonCenter : null,
        disabled ? styles.buttonDisabled : null,
        pressed && !isNonInteractive ? styles.buttonPressed : null,
      ]}
    >
      <Text style={[styles.label, disabled ? styles.labelDisabled : null]}>{label}</Text>
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : showIcon ? (
        <View style={[styles.iconCircle, disabled ? styles.iconCircleDisabled : null]}>
          <Feather
            name="plus"
            size={16}
            color={disabled ? colors.placeholder : colors.textPrimary}
          />
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
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  buttonCenter: {
    justifyContent: 'center',
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
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  labelDisabled: {
    color: colors.placeholder,
  },
});
