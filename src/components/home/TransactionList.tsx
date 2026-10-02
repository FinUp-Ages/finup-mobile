import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { darkColors } from '@/theme/colors';
import type { Transaction } from '@/types/transaction';
import { formatCurrency, formatTransactionDate } from '@/utils/transactions';

type TransactionListProps = {
  transactions: Transaction[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return <Text style={styles.empty}>Nenhuma transação neste período.</Text>;
  }

  return (
    <View style={styles.list}>
      {transactions.map((transaction) => {
        const income = transaction.type === 'INCOME';
        const typeLabel = income ? 'Entrada' : 'Saída';
        return (
          <View key={transaction.id} style={styles.row}>
            <View style={styles.icon}>
              <Feather
                color={darkColors.textMuted}
                name={income ? 'arrow-down-left' : 'arrow-up-right'}
                size={20}
              />
            </View>
            <View style={styles.details}>
              <Text style={styles.description}>{transaction.description?.trim() || typeLabel}</Text>
              <Text style={styles.metadata}>
                {typeLabel} · {formatTransactionDate(transaction.transactionDate)}
                {transaction.isRecurring ? ' · Recorrente' : ''}
              </Text>
            </View>
            <Text style={styles.amount}>
              {income ? '+' : '−'} {formatCurrency(transaction.amount)}
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
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  description: {
    color: darkColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    flex: 1,
    gap: 4,
  },
  empty: {
    color: darkColors.textMuted,
    paddingVertical: 16,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 8,
  },
  metadata: {
    color: darkColors.textMuted,
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
});
