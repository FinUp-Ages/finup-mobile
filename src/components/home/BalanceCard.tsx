import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { darkColors } from '@/theme/colors';
import { formatCurrency } from '@/utils/transactions';

/**
 * COMPONENT - saldo do periodo retornado pelo backend.
 * null significa que o saldo ainda nao esta disponivel, nunca saldo zero.
 */
type BalanceCardProps = {
  period: string;
  balance: number | null;
};

export function BalanceCard({ period, balance }: BalanceCardProps) {
  return (
    <LinearGradient
      colors={darkColors.balanceCardGradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>SALDO DO PERÍODO</Text>
        <View style={styles.periodBadge}>
          <Text style={styles.periodLabel}>{period}</Text>
        </View>
      </View>

      <Text style={styles.balance}>{balance === null ? '—' : formatCurrency(balance)}</Text>

      <Text style={styles.helperText}>Entradas menos saídas no período selecionado.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  balance: {
    color: darkColors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  eyebrow: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  periodBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  periodLabel: {
    color: darkColors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});
