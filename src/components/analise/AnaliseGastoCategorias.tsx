import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AnaliseCategoriaDonut } from '@/components/analise/AnaliseCategoriaDonut';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';
import type { AnaliseCategoryExpense } from '@/types/analise';

type AnaliseGastoCategoriasProps = {
  expenses: AnaliseCategoryExpense[];
  total: string;
};

type ChartMode = 'bar' | 'pie';

const PALETTE = darkColors.analiseCategoryPalette;

/** Categorias referentes ao período selecionado, em barras ou em círculo (pizza). */
export function AnaliseGastoCategorias({ expenses, total }: AnaliseGastoCategoriasProps) {
  const [mode, setMode] = useState<ChartMode>('bar');
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visibleExpenses = showAll ? expenses : expenses.slice(0, 3);
  const colors = expenses.map((_, index) => PALETTE[index % PALETTE.length]);

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Seu gasto em categorias</Text>
        <Pressable
          accessibilityHint="Alterna entre gráfico em barra e em pizza"
          accessibilityLabel={`Gráfico em ${mode === 'bar' ? 'barra' : 'pizza'}. Alterar`}
          accessibilityRole="button"
          onPress={() => {
            setMode((current) => (current === 'bar' ? 'pie' : 'bar'));
            setSelectedId(null);
          }}
          style={({ pressed }) => [styles.pill, pressed ? styles.pressed : null]}
        >
          <Text style={styles.pillLabel}>{mode === 'bar' ? 'Gráfico em barra' : 'Gráfico em pizza'}</Text>
        </Pressable>
      </View>

      {!expenses.length ? (
        <Text style={styles.emptyText}>Nenhum gasto no período selecionado.</Text>
      ) : mode === 'pie' ? (
        <View style={styles.pieArea}>
          <AnaliseCategoriaDonut
            colors={[...colors]}
            expenses={expenses}
            onSelect={setSelectedId}
            selectedId={selectedId}
            total={total}
          />
        </View>
      ) : (
        <>
          <View>
            <CategoryTotal total={total} />
            {visibleExpenses.map((expense, index) => (
              <CategoryRow
                color={colors[index]}
                expense={expense}
                highlighted={index % 2 === 1}
                key={expense.id}
              />
            ))}
          </View>
          {expenses.length > 3 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAll((current) => !current)}
              style={styles.moreButton}
            >
              <Text style={styles.moreLabel}>{showAll ? 'Ver menos' : 'Ver mais'}</Text>
              <Feather
                color={darkColors.textPrimary}
                name={showAll ? 'chevron-up' : 'chevron-down'}
                size={20}
              />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

function CategoryTotal({ total }: { total: string }) {
  return (
    <View style={[styles.categoryRow, styles.categoryRowHighlighted]}>
      <View style={styles.track}>
        <View style={[styles.fill, styles.full, { backgroundColor: darkColors.analiseBar }]} />
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.muted}>Gasto total</Text>
        <Text style={styles.muted}>{total}</Text>
      </View>
    </View>
  );
}

function CategoryRow({
  color,
  expense,
  highlighted,
}: {
  color: string;
  expense: AnaliseCategoryExpense;
  highlighted: boolean;
}) {
  return (
    <View style={[styles.categoryRow, highlighted ? styles.categoryRowHighlighted : null]}>
      <View style={styles.labelRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { backgroundColor: color, width: `${expense.percentage}%` }]} />
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
  categoryRow: { gap: 8, padding: 16 },
  categoryRowHighlighted: { backgroundColor: darkColors.analiseCard },
  emptyText: { color: darkColors.textMuted, fontSize: 13, padding: 16, textAlign: 'center' },
  fill: { borderRadius: 100, height: '100%' },
  full: { width: '100%' },
  labelRow: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  moreButton: { alignItems: 'center', alignSelf: 'center', paddingVertical: 4 },
  moreLabel: { color: darkColors.textPrimary, fontSize: 13, fontWeight: '600', letterSpacing: 0.26 },
  muted: { color: darkColors.textMuted, fontSize: 12, letterSpacing: 0.24 },
  percentage: { color: darkColors.textPrimary, fontSize: 12, fontWeight: '600', width: 34 },
  pieArea: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    // Centraliza o círculo entre o título e a barra de abas: anula o gap do título e o
    // respiro de baixo do conteúdo, que deixavam o gráfico mais perto do título.
    marginBottom: -48,
    marginTop: -16,
  },
  pill: {
    backgroundColor: darkColors.analisePill,
    borderColor: darkColors.analisePillBorder,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillLabel: { color: darkColors.textBadge, fontSize: 11, letterSpacing: 0.22 },
  pressed: { opacity: 0.7 },
  section: { flexGrow: 1, gap: 16 },
  title: { color: darkColors.textPrimary, fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  track: { borderRadius: 100, flex: 1, height: 16, overflow: 'hidden' },
});
