import { Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { BackHandler, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PeriodPickerModal } from '@/components/home/PeriodPickerModal';
import { Text } from '@/components/ui/AppText';
import { BrandGradient } from '@/components/ui/BrandGradient';
import { colors, darkColors } from '@/theme/colors';
import type { AnaliseMovement, AnalisePeriodKey, AnaliseSortOrder } from '@/types/analise';
import { ANALISE_SORT_OPTIONS } from '@/utils/analiseFiltrosMovimentacoes';
import { ANALISE_PERIODS } from '@/utils/analisePeriods';

type AnaliseMovimentacoesModalProps = {
  movements: AnaliseMovement[];
  onClose: () => void;
  onSelectPeriod: (key: AnalisePeriodKey) => void;
  onSelectSortOrder: (order: AnaliseSortOrder) => void;
  periodKey: AnalisePeriodKey;
  periodLabel: string;
  sortOrder: AnaliseSortOrder;
  visible: boolean;
};

/** Lista completa das transações ativas, sobreposta somente à área da aba. */
export function AnaliseMovimentacoesModal({
  movements,
  onClose,
  onSelectPeriod,
  onSelectSortOrder,
  periodKey,
  periodLabel,
  sortOrder,
  visible,
}: AnaliseMovimentacoesModalProps) {
  const insets = useSafeAreaInsets();
  const [periodOpen, setPeriodOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose, visible]);

  if (!visible) return null;

  return (
    <View accessibilityViewIsModal style={StyleSheet.absoluteFill}>
      <BrandGradient />
      <View
        style={[styles.content, { paddingBottom: insets.bottom + 20, paddingTop: insets.top + 20 }]}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Transações</Text>
            <Pressable
              accessibilityLabel="Fechar transações"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.closeButtonPressed : null,
              ]}
            >
              <Feather color={colors.navy} name="x" size={20} />
            </Pressable>
          </View>
          <View style={styles.filters}>
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

          {movements.length ? (
            <FlatList
              contentContainerStyle={styles.list}
              data={movements}
              initialNumToRender={12}
              keyExtractor={(movement) => movement.id}
              removeClippedSubviews
              renderItem={({ item }) => <MovementRow movement={item} />}
              showsVerticalScrollIndicator={false}
              windowSize={7}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Sem transações no período</Text>
            </View>
          )}
        </View>
      </View>
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
    </View>
  );
}

function MovementRow({ movement }: { movement: AnaliseMovement }) {
  const income = movement.type === 'INCOME';
  return (
    <View style={styles.row}>
      <View style={styles.rowDetails}>
        <View
          style={[
            styles.dot,
            { backgroundColor: income ? darkColors.incomeDot : darkColors.expenseDot },
          ]}
        />
        <View>
          <Text style={styles.category}>{movement.title}</Text>
          <Text style={styles.date}>{movement.date}</Text>
        </View>
      </View>
      <Text
        style={[styles.amount, { color: income ? darkColors.incomeText : darkColors.expenseText }]}
      >
        {movement.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: { fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: colors.glassSoft, borderRadius: 12, flex: 1, padding: 16 },
  category: { color: darkColors.textPrimary, fontSize: 14, fontWeight: '600' },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  closeButtonPressed: { transform: [{ scale: 0.95 }] },
  content: { flex: 1, paddingHorizontal: 20 },
  date: { color: darkColors.textMuted, fontSize: 12, marginTop: 2 },
  dot: { borderRadius: 4, height: 8, width: 8 },
  empty: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  emptyText: { color: darkColors.textMuted, fontSize: 14, textAlign: 'center' },
  filters: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  list: { gap: 4, paddingBottom: 8 },
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
  pressed: { opacity: 0.7 },
  row: {
    alignItems: 'center',
    borderBottomColor: darkColors.surfaceBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowDetails: { alignItems: 'center', flexDirection: 'row', gap: 10, flex: 1 },
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
  title: { color: darkColors.textPrimary, fontSize: 18, fontWeight: '700' },
});
