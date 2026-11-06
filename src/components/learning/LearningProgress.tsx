import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui/AppText';
import { colors, learningColors } from '@/theme/colors';

export function LearningProgress({ value }: { value: number | null }) {
  const circumference = 2 * Math.PI * 31.5;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={
        value === null ? 'Progresso ainda não disponível' : 'Progresso de demonstração'
      }
      accessibilityValue={
        value === null ? { text: 'Indisponível' } : { min: 0, max: 100, now: value }
      }
      style={styles.container}
    >
      <Svg width={78} height={78} style={StyleSheet.absoluteFill}>
        <Circle
          cx={39}
          cy={39}
          r={31.5}
          fill="none"
          stroke={learningColors.progressTrack}
          strokeWidth={7}
        />
        {value !== null && (
          <Circle
            cx={39}
            cy={39}
            r={31.5}
            fill="none"
            stroke={learningColors.progress}
            strokeWidth={7}
            strokeDasharray={`${(circumference * value) / 100} ${circumference}`}
            rotation={-90}
            origin="39, 39"
          />
        )}
      </Svg>
      <Text style={[styles.value, value === null && styles.unavailable]}>
        {value === null ? '—' : `${value}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 78, width: 78, alignItems: 'center', justifyContent: 'center' },
  value: { color: learningColors.progress, fontSize: 24, fontWeight: '700' },
  unavailable: { color: colors.placeholderOnDark },
});
