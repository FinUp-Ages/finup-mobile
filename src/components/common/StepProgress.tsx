import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type StepProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  const ratio = currentStep / totalSteps;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
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
    borderRadius: 2,
    height: 3,
  },
  label: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  track: {
    backgroundColor: colors.track,
    borderRadius: 2,
    height: 3,
    overflow: 'hidden',
    width: '100%',
  },
  wrapper: {
    marginBottom: 16,
    marginTop: 'auto',
  },
});
