import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { PillButton } from '@/components/ui/PillButton';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - card de saldo total, em estado vazio/mascarado.
 *
 * Nao ha endpoint de saldo consumido ainda - o valor fica sempre mascarado
 * ("R$ .........") ate a Etapa 2 do cadastro (informacoes complementares)
 * existir de verdade. `onPressAdd` e o ponto de integracao futuro.
 */
type BalanceCardProps = {
  period: string;
  onPressAdd: () => void;
};

export function BalanceCard({ period, onPressAdd }: BalanceCardProps) {
  return (
    <LinearGradient
      colors={darkColors.balanceCardGradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>SALDO TOTAL</Text>
        <View style={styles.periodBadge}>
          <Text style={styles.periodLabel}>{period}</Text>
        </View>
      </View>

      <Text style={styles.balance}>R$ ..........</Text>

      <Text style={styles.helperText}>
        Adicione suas informações para usar esta funcionalidade e aumentar seu score!
      </Text>

      <PillButton icon="plus" label="Adicionar informações" onPress={onPressAdd} />
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
    marginBottom: 16,
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
