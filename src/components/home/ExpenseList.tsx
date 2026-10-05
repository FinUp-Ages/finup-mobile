import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { IntegrateCardsCard } from '@/components/home/IntegrateCardsCard';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';
import type { HomeExpense, HomeStatus } from '@/types/home';

/**
 * COMPONENT - conteudo da secao "Gastos" da Home.
 *
 * Lista as despesas do periodo (GET /api/v1/transactions, ja filtradas e
 * formatadas pelo ViewModel). Sem gastos, o card "Integrar cartoes" do design
 * e o estado vazio. O "tentar novamente" fica so no card de saldo: as duas
 * secoes vem da mesma chamada.
 */
type ExpenseListProps = {
  status: HomeStatus;
  expenses: HomeExpense[];
  onPressIntegrate: () => void;
};

export function ExpenseList({ status, expenses, onPressIntegrate }: ExpenseListProps) {
  if (status === 'loading') {
    return (
      <View style={styles.feedback}>
        <ActivityIndicator accessibilityLabel="Carregando gastos" color={darkColors.textMuted} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.feedback}>
        <Text style={styles.feedbackText}>Não foi possível carregar seus gastos.</Text>
      </View>
    );
  }

  if (expenses.length === 0) {
    return <IntegrateCardsCard onPressIntegrate={onPressIntegrate} />;
  }

  return (
    <View style={styles.card}>
      {expenses.map((expense, index) => (
        <View
          key={expense.id}
          style={[styles.row, index > 0 ? styles.rowDivider : null]}
          accessible
          accessibilityLabel={`${expense.title}, ${expense.amount}, ${expense.date}`}
        >
          <View style={styles.rowText}>
            <Text numberOfLines={1} style={styles.title}>
              {expense.title}
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {expense.categoryName ? `${expense.categoryName} · ${expense.date}` : expense.date}
            </Text>
          </View>
          <Text style={styles.amount}>{expense.amount}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: darkColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  card: {
    backgroundColor: darkColors.surface,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  feedback: {
    backgroundColor: darkColors.surface,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  feedbackText: {
    color: darkColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
  },
  rowDivider: {
    borderTopColor: darkColors.surfaceBorder,
    borderTopWidth: 1,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    color: darkColors.textMuted,
    fontSize: 12,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
