import { Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { PeriodPickerModal } from '@/components/home/PeriodPickerModal';
import { Text } from '@/components/ui/AppText';
import { colors, darkColors } from '@/theme/colors';
import type { AnaliseMovement, AnalisePeriodKey, AnaliseSortOrder } from '@/types/analise';
import { ANALISE_SORT_OPTIONS } from '@/utils/analiseFiltrosMovimentacoes';
import { ANALISE_PERIODS } from '@/utils/analisePeriods';

type AnaliseMovimentacoesProps = {
  movements: AnaliseMovement[];
  periodKey: AnalisePeriodKey;
  periodLabel: string;
  onPressViewMore: () => void;
  onSelectPeriod: (key: AnalisePeriodKey) => void;
  onSelectSortOrder: (order: AnaliseSortOrder) => void;
  sortOrder: AnaliseSortOrder;
};

export function AnaliseMovimentacoes({
  movements,
  periodKey,
  periodLabel,
  onPressViewMore,
  onSelectPeriod,
  onSelectSortOrder,
  sortOrder,
}: AnaliseMovimentacoesProps) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <LinearGradient
      colors={darkColors.analiseMovementGradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TRANSAÇÕES</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel={`Período: ${periodLabel}. Alterar`}
            accessibilityRole="button"
            onPress={() => setPeriodOpen(true)}
            style={({ pressed }) => [styles.periodButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.periodLabel}>{periodLabel}</Text>
            <Feather color={darkColors.textBadge} name="chevron-down" size={14} />
          </Pressable>
          <Pressable
            accessibilityLabel="Alterar ordenação das transações"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setSortOpen(true)}
            style={({ pressed }) => [styles.sortButton, pressed ? styles.pressed : null]}
          >
            <MaterialIcons color={darkColors.textBadge} name="swap-vert" size={18} />
          </Pressable>
        </View>
      </View>

      {movements.length ? (
        <ScrollView
          contentContainerStyle={styles.carousel}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {movements.slice(0, 10).map((movement) => (
            <MovementCard key={movement.id} movement={movement} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Sem transações no período</Text>
        </View>
      )}

      <Pressable
        accessibilityLabel="Ver todas as transações"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onPressViewMore}
        style={({ pressed }) => [styles.moreButton, pressed ? styles.pressed : null]}
      >
        <Text style={styles.moreLabel}>Ver mais</Text>
        <Feather color={darkColors.textPrimary} name="arrow-right" size={18} />
      </Pressable>

      <PeriodPickerModal
        onClose={() => setPeriodOpen(false)}
        onSelect={onSelectPeriod}
        options={ANALISE_PERIODS}
        selected={periodKey}
        visible={periodOpen}
      />
      <PeriodPickerModal
        onClose={() => setSortOpen(false)}
        onSelect={onSelectSortOrder}
        options={ANALISE_SORT_OPTIONS}
        selected={sortOrder}
        title="Ordenar por"
        visible={sortOpen}
      />
    </LinearGradient>
  );
}

function MovementCard({ movement }: { movement: AnaliseMovement }) {
  const income = movement.type === 'INCOME';
  return (
    <View
      accessible
      accessibilityLabel={`${income ? 'Entrada' : 'Saída'} em ${movement.categoryName}, ${movement.amount}`}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.dot,
            { backgroundColor: income ? darkColors.incomeDot : darkColors.expenseDot },
          ]}
        />
        <Text style={styles.cardType}>{income ? 'Entrada' : 'Saída'}</Text>
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        numberOfLines={1}
        style={[
          styles.cardAmount,
          { color: income ? darkColors.incomeText : darkColors.expenseText },
        ]}
      >
        {movement.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassSoft,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 10,
    borderWidth: 1,
    gap: 16,
    height: 76,
    padding: 12,
    width: 132,
  },
  cardAmount: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  cardType: { color: darkColors.textBadge, fontSize: 11 },
  carousel: { gap: 10, marginTop: 32, paddingRight: 4 },
  container: { borderRadius: 12, gap: 0, minHeight: 255, overflow: 'hidden', padding: 24 },
  dot: { borderRadius: 4, height: 7, width: 7 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 116,
    marginTop: 32,
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: { color: darkColors.textMuted, fontSize: 13, textAlign: 'center' },
  eyebrow: { color: darkColors.textBadge, fontSize: 15, fontWeight: '500', letterSpacing: 0.4 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  moreButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
  },
  moreLabel: { color: darkColors.textPrimary, fontSize: 14, fontWeight: '600' },
  periodButton: {
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderColor: colors.glassSoft,
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  periodLabel: { color: darkColors.textBadge, fontSize: 11 },
  sortButton: {
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderColor: colors.glassSoft,
    borderRadius: 100,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  pressed: { opacity: 0.7 },
});
