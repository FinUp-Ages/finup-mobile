import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { IntegrateCardsCard } from '@/components/home/IntegrateCardsCard';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';
import type { HomeExpense, HomeStatus } from '@/types/home';

type ExpenseListProps = {
  status: HomeStatus;
  expenses: HomeExpense[];
  onPressIntegrate: () => void;
  emptyMessage?: string;
};

export function ExpenseList({
  status,
  expenses,
  onPressIntegrate,
  emptyMessage,
}: ExpenseListProps) {
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
    if (emptyMessage) {
      return (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{emptyMessage}</Text>
        </View>
      );
    }
    return <IntegrateCardsCard onPressIntegrate={onPressIntegrate} />;
  }

  return (
    <View style={styles.card}>
      {expenses.map((expense, index) => {
        const isIncome = expense.type === 'INCOME';

        return (
          <View
            accessibilityLabel={`${expense.title}, ${expense.amount}, ${expense.date}`}
            accessible
            key={expense.id}
            style={[styles.row, index > 0 ? styles.rowDivider : null]}
          >
            <View style={styles.rowText}>
              <Text numberOfLines={1} style={styles.title}>
                {expense.title}
              </Text>
              <Text numberOfLines={1} style={styles.subtitle}>
                {expense.categoryName ? `${expense.categoryName} • ${expense.date}` : expense.date}
              </Text>
            </View>
            <Text style={[styles.amount, isIncome ? styles.amountIncome : null]}>
              {expense.amount}
            </Text>
          </View>
        );
      })}
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
  amountIncome: {
    color: darkColors.incomeText,
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
    textAlign: 'center',
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