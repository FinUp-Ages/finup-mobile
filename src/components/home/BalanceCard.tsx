import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { PeriodPickerModal } from '@/components/home/PeriodPickerModal';
import { HomePillButton } from '@/components/ui/HomePillButton';
import { colors, darkColors } from '@/theme/colors';
import type { HomeStatus } from '@/types/home';
import type { HomePeriodKey } from '@/utils/homePeriods';

/**
 * COMPONENT - card de saldo total do periodo (GET /api/v1/transactions), com
 * entradas, saidas e o botao "Adicionar transacao" (ver Figma).
 *
 * Estados: carregando (indicador no lugar do valor), erro (mensagem + tentar
 * novamente) e sucesso (valores ja formatados em BRL). O botao de adicionar
 * aparece em todos os estados menos erro/carregando.
 */

type BalanceCardProps = {
  period: string;
  periodKey: HomePeriodKey;
  onSelectPeriod: (key: HomePeriodKey) => void;
  status: HomeStatus;
  balance: string | null;
  income: string | null;
  expense: string | null;
  onPressAdd: () => void;
  onRetry: () => void;
};

export function BalanceCard({
  period,
  periodKey,
  onSelectPeriod,
  status,
  balance,
  income,
  expense,
  onPressAdd,
  onRetry,
}: BalanceCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  return (
    <LinearGradient
      colors={darkColors.balanceCardGradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>SALDO TOTAL</Text>
        <Pressable
          accessibilityLabel={`Período: ${period}. Alterar`}
          accessibilityRole="button"
          onPress={() => setPickerOpen(true)}
          style={styles.periodBadge}
        >
          <Text style={styles.periodLabel}>{period}</Text>
          <Feather color={darkColors.textBadge} name="chevron-down" size={12} />
        </Pressable>
      </View>

      {status === 'loading' ? (
        <View style={styles.balanceSlot}>
          <ActivityIndicator accessibilityLabel="Carregando saldo" color={darkColors.textPrimary} />
        </View>
      ) : null}

      {status === 'error' ? (
        <>
          <Text style={styles.helperText}>Não foi possível carregar seu saldo.</Text>
          <HomePillButton icon="refresh-cw" label="Tentar novamente" onPress={onRetry} />
        </>
      ) : null}

      {status === 'success' ? (
        <>
          <View style={styles.balanceRow}>
            <Text style={styles.balance}>{hidden ? 'R$ ••••••' : balance}</Text>
            <Pressable
              accessibilityLabel={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => setHidden((value) => !value)}
            >
              <Feather
                color={darkColors.iconOnCard}
                name={hidden ? 'eye-off' : 'eye'}
                size={20}
              />
            </Pressable>
          </View>

          <View style={styles.totalsRow}>
            <View style={styles.totalBox}>
              <View style={styles.totalHeader}>
                <View style={[styles.dot, { backgroundColor: darkColors.incomeDot }]} />
                <Text style={styles.totalLabel}>ENTRADA</Text>
              </View>
              <Text style={[styles.totalValue, { color: darkColors.incomeText }]}>{income}</Text>
            </View>
            <View style={styles.totalBox}>
              <View style={styles.totalHeader}>
                <View style={[styles.dot, { backgroundColor: darkColors.expenseDot }]} />
                <Text style={styles.totalLabel}>SAÍDA</Text>
              </View>
              <Text style={[styles.totalValue, { color: darkColors.expenseText }]}>{expense}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onPressAdd}
            style={({ pressed }) => [styles.addButton, pressed ? styles.addPressed : null]}
          >
            <Text style={styles.addLabel}>Adicionar transação</Text>
            <Feather color={colors.navy} name="plus" size={18} />
          </Pressable>
        </>
      ) : null}
      <PeriodPickerModal
        onClose={() => setPickerOpen(false)}
        onSelect={onSelectPeriod}
        selected={periodKey}
        visible={pickerOpen}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  addLabel: {
    color: colors.navy,
    fontSize: 16,
  },
  addPressed: {
    opacity: 0.85,
  },
  balance: {
    color: darkColors.textPrimary,
    fontSize: 34,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  balanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  // Mesma altura da linha do valor, para o card nao pular ao terminar de carregar.
  balanceSlot: {
    alignItems: 'flex-start',
    height: 34,
    justifyContent: 'center',
    marginTop: 16,
  },
  card: {
    borderRadius: 12,
    padding: 24,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  eyebrow: {
    color: darkColors.textLabel,
    fontSize: 12,
    letterSpacing: 0.24,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helperText: {
    color: darkColors.textHelper,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 8,
  },
  periodBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.glass,
    borderColor: colors.glassSoft,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  periodLabel: {
    color: darkColors.textBadge,
    fontSize: 11,
    letterSpacing: 0.22,
  },
  totalBox: {
    backgroundColor: colors.glassSoft,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 14,
  },
  totalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  totalLabel: {
    color: darkColors.textCaption,
    fontSize: 11,
    letterSpacing: 0.22,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
});
