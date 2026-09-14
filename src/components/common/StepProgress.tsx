import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - indicador de progresso do wizard (barra + "0X/0Y").
 *
 * Passivo: so desenha a proporcao recebida por props.
 */
type StepProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  const ratio = currentStep / totalSteps;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={[styles.fill, { flex: ratio }]} />
        <View style={{ flex: 1 - ratio }} />
      </View>
      <Text style={styles.label}>
        {String(currentStep).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  track: {
    backgroundColor: colors.track,
    borderRadius: 4,
    flexDirection: 'row',
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  wrapper: {
    marginTop: 'auto',
    paddingBottom: 8,
  },
});
