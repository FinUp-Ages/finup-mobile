import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';
import type { AnaliseCategoryExpense } from '@/types/analise';

type AnaliseGastoCategoriasProps = {
  expenses: AnaliseCategoryExpense[];
  total: string;
};

/** Categorias referentes ao período selecionado. */
export function AnaliseGastoCategorias({ expenses, total }: AnaliseGastoCategoriasProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleExpenses = showAll ? expenses : expenses.slice(0, 3);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Seu gasto em categorias</Text>
      <View style={styles.card}>
        <CategoryTotal total={total} />
        {expenses.length ? (
          visibleExpenses.map((expense, index) => (
            <CategoryRow expense={expense} highlighted={index % 2 === 1} key={expense.id} />
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum gasto no período selecionado.</Text>
        )}
      </View>
      <Pressable accessibilityRole="button" onPress={() => setShowAll((current) => !current)}>
        <Text style={styles.moreButton}>{showAll ? 'Ver menos' : 'Ver mais'}</Text>
      </Pressable>
    </View>
  );
}

function CategoryTotal({ total }: { total: string }) {
  return (
    <View style={styles.totalRow}>
      <View style={styles.track}>
        <View style={[styles.fill, styles.full]} />
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.muted}>Gasto total</Text>
        <Text style={styles.muted}>{total}</Text>
      </View>
    </View>
  );
}

function CategoryRow({
  expense,
  highlighted,
}: {
  expense: AnaliseCategoryExpense;
  highlighted: boolean;
}) {
  return (
    <View style={[styles.categoryRow, highlighted ? styles.categoryRowHighlighted : null]}>
      <View style={styles.labelRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${expense.percentage}%` }]} />
        </View>
        <Text style={styles.percentage}>{expense.percentage}%</Text>
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.muted}>{expense.name}</Text>
        <Text style={styles.muted}>{expense.amount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 0 },
  categoryRow: { gap: 8, padding: 16 },
  categoryRowHighlighted: { backgroundColor: darkColors.analiseCard },
  emptyText: { color: darkColors.textMuted, fontSize: 13, padding: 16, textAlign: 'center' },
  fill: { backgroundColor: darkColors.analiseBar, borderRadius: 100, height: '100%' },
  full: { width: '100%' },
  labelRow: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  muted: { color: darkColors.textMuted, fontSize: 12 },
  moreButton: {
    color: darkColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  percentage: { color: darkColors.textPrimary, fontSize: 12, fontWeight: '600', width: 34 },
  section: { gap: 16 },
  title: { color: darkColors.textPrimary, fontSize: 15, fontWeight: '700' },
  totalRow: { backgroundColor: darkColors.analiseCard, gap: 8, padding: 16 },
  track: { borderRadius: 100, flex: 1, height: 16, overflow: 'hidden' },
});
