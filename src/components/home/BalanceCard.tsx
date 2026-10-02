import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { PeriodPickerModal } from '@/components/home/PeriodPickerModal';
import { HomePillButton } from '@/components/ui/HomePillButton';
import { darkColors } from '@/theme/colors';
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
// Figma: linear-gradient(128.92deg, #2343BD 0%, #3B82F6 100%) em 371x305 (~ canto a canto).
const BALANCE_GRADIENT = ['#2343BD', '#3B82F6'] as const;

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
      colors={BALANCE_GRADIENT}
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
          <Feather color="rgba(255, 255, 255, 0.7)" name="chevron-down" size={12} />
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
                color="rgba(255, 255, 255, 0.8)"
                name={hidden ? 'eye-off' : 'eye'}
                size={20}
              />
            </Pressable>
          </View>

          <View style={styles.totalsRow}>
            <View style={styles.totalBox}>
              <View style={styles.totalHeader}>
                <View style={[styles.dot, { backgroundColor: '#00d492' }]} />
                <Text style={styles.totalLabel}>ENTRADA</Text>
              </View>
              <Text style={[styles.totalValue, { color: '#5ee9b5' }]}>{income}</Text>
            </View>
            <View style={styles.totalBox}>
              <View style={styles.totalHeader}>
                <View style={[styles.dot, { backgroundColor: '#ff637e' }]} />
                <Text style={styles.totalLabel}>SAÍDA</Text>
              </View>
              <Text style={[styles.totalValue, { color: '#ffa1ad' }]}>{expense}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onPressAdd}
            style={({ pressed }) => [styles.addButton, pressed ? styles.addPressed : null]}
          >
            <Text style={styles.addLabel}>Adicionar transação</Text>
            <Feather color="#021736" name="plus" size={18} />
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
    backgroundColor: '#ffffff',
    borderRadius: 10000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  addLabel: {
    color: '#021736',
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    letterSpacing: 0.24,
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  periodLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    letterSpacing: 0.22,
  },
  totalBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: 'rgba(255, 255, 255, 0.55)',
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
