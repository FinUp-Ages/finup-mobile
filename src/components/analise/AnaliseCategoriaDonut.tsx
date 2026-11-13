import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';
import { hitTestDonut } from '@/utils/donutHitTest';
import type { AnaliseCategoryExpense } from '@/types/analise';

const SIZE = 262;
const STROKE = 18;
const GAP = 2;
const TOUCH_TOLERANCE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER_WIDTH = SIZE - STROKE * 2 - 24;

type AnaliseCategoriaDonutProps = {
  colors: string[];
  expenses: AnaliseCategoryExpense[];
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  total: string;
};

/**
 * Círculo (donut) do gasto por categoria. Tocar numa fatia mostra o valor dela no centro e
 * apaga as demais; tocar de novo, ou no centro, volta ao gasto total.
 */
export function AnaliseCategoriaDonut({
  colors,
  expenses,
  onSelect,
  selectedId,
  total,
}: AnaliseCategoriaDonutProps) {
  const sum = expenses.reduce((acc, expense) => acc + expense.percentage, 0) || 1;
  const selected = expenses.find((expense) => expense.id === selectedId) ?? null;
  const selectedColor = selected ? colors[expenses.indexOf(selected)] : darkColors.textPrimary;
  const gap = expenses.length > 1 ? GAP : 0;

  const segments = expenses.map((expense, index) => {
    const before = expenses.slice(0, index).reduce((acc, item) => acc + item.percentage, 0);
    return {
      color: colors[index],
      expense,
      length: (expense.percentage / sum) * CIRCUMFERENCE,
      offset: (before / sum) * CIRCUMFERENCE,
    };
  });

  const handleRingPress = (x: number, y: number) => {
    const hit = hitTestDonut(x, y, {
      size: SIZE,
      stroke: STROKE,
      tolerance: TOUCH_TOLERANCE,
      weights: expenses.map((expense) => expense.percentage),
    });
    if (hit.kind === 'center') onSelect(null);
    if (hit.kind === 'segment') {
      const { id } = expenses[hit.index];
      onSelect(id === selectedId ? null : id);
    }
  };

  const summary = expenses.map((expense) => `${expense.name} ${expense.percentage}%`).join(', ');

  return (
    <View
      accessibilityLabel={`Gráfico em pizza. Gasto total ${total}. ${summary}.`}
      accessible
      style={styles.wrapper}
    >
      <Svg height={SIZE} width={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          fill="none"
          r={RADIUS}
          stroke={darkColors.analiseDonutTrack}
          strokeWidth={STROKE}
        />
        {segments.map(({ color, expense, length, offset: start }) => (
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            key={expense.id}
            opacity={selected && selected.id !== expense.id ? 0.18 : 1}
            originX={SIZE / 2}
            originY={SIZE / 2}
            r={RADIUS}
            rotation={-90}
            stroke={color}
            strokeDasharray={`${Math.max(length - gap, 0.5)} ${CIRCUMFERENCE}`}
            strokeDashoffset={-start}
            strokeWidth={STROKE}
          />
        ))}
      </Svg>
      {/* O toque nativo do SVG usa o circulo inteiro de cada fatia; a fatia sai do angulo do toque. */}
      <Pressable
        onPress={(event) =>
          handleRingPress(event.nativeEvent.locationX, event.nativeEvent.locationY)
        }
        style={StyleSheet.absoluteFill}
      />
      <Pressable
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onPress={() => onSelect(null)}
        style={styles.center}
      >
        <Text style={[styles.label, { color: selectedColor }]}>
          {selected ? selected.name : 'Gasto total'}
        </Text>
        <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.value}>
          {selected ? selected.amount : total}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: 2,
    justifyContent: 'center',
    left: (SIZE - CENTER_WIDTH) / 2,
    position: 'absolute',
    width: CENTER_WIDTH,
  },
  label: {
    alignSelf: 'stretch',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.24,
    textAlign: 'center',
  },
  value: {
    alignSelf: 'stretch',
    color: darkColors.textPrimary,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    letterSpacing: 0.48,
    textAlign: 'center',
  },
  wrapper: { alignItems: 'center', height: SIZE, justifyContent: 'center', width: SIZE },
});
