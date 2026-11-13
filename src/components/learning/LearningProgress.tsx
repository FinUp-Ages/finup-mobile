import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui/AppText';
import { colors, learningColors } from '@/theme/colors';

/** Avanço no curso (níveis concluídos), não percentual de acertos. */
export function LearningProgress({
  value,
  demo = false,
}: {
  value: number | null;
  demo?: boolean;
}) {
  const circumference = 2 * Math.PI * 31.5;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={
        value === null
          ? 'Progresso ainda não disponível'
          : demo
            ? 'Progresso de demonstração no curso'
            : 'Progresso no curso'
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
      {/* O texto cabe no miolo do anel (56 px): "100%" usa fonte menor, e fonte ampliada encolhe. */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={[
          styles.value,
          value !== null && value >= 100 && styles.full,
          value === null && styles.unavailable,
        ]}
      >
        {value === null ? '—' : `${value}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 78, width: 78, alignItems: 'center', justifyContent: 'center' },
  value: {
    color: learningColors.progress,
    fontSize: 24,
    fontWeight: '700',
    maxWidth: 54,
    textAlign: 'center',
  },
  full: { fontSize: 18 },
  unavailable: { color: colors.placeholderOnDark },
});
