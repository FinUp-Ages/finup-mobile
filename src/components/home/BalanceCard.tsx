import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PillButton } from '@/components/ui/PillButton';
import { darkColors } from '@/theme/colors';
import type { HomeStatus } from '@/types/home';

/**
 * COMPONENT - card de saldo total do periodo (GET /api/v1/transactions).
 *
 * Estados: carregando (indicador no lugar do valor), erro (mensagem + tentar
 * novamente) e sucesso (valor ja formatado em BRL). Sem transacoes no periodo
 * o valor e R$ 0,00 e o card mantem o convite do design para adicionar
 * informacoes; `onPressAdd` segue como ponto de integracao futuro.
 */
type BalanceCardProps = {
  period: string;
  status: HomeStatus;
  balance: string | null;
  showAddHint: boolean;
  onPressAdd: () => void;
  onRetry: () => void;
};

export function BalanceCard({
  period,
  status,
  balance,
  showAddHint,
  onPressAdd,
  onRetry,
}: BalanceCardProps) {
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

      {status === 'loading' ? (
        <View style={styles.balanceSlot}>
          <ActivityIndicator accessibilityLabel="Carregando saldo" color={darkColors.textPrimary} />
        </View>
      ) : null}

      {status === 'error' ? (
        <>
          <Text style={styles.helperText}>Não foi possível carregar seu saldo.</Text>
          <PillButton icon="refresh-cw" label="Tentar novamente" onPress={onRetry} />
        </>
      ) : null}

      {status === 'success' ? (
        <>
          <Text style={styles.balance}>{balance}</Text>
          {showAddHint ? (
            <>
              <Text style={styles.helperText}>
                Adicione suas informações para usar esta funcionalidade e aumentar seu score!
              </Text>
              <PillButton icon="plus" label="Adicionar informações" onPress={onPressAdd} />
            </>
          ) : null}
        </>
      ) : null}
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
  // Mesma altura da linha do valor, para o card nao pular ao terminar de carregar.
  balanceSlot: {
    alignItems: 'flex-start',
    height: 34,
    justifyContent: 'center',
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
