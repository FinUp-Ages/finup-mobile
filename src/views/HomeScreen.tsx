import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '@/components/home/BalanceCard';
import { ExpenseList } from '@/components/home/ExpenseList';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ScoreBannerCard } from '@/components/home/ScoreBannerCard';
import { TypeFilterPills } from '@/components/home/TypeFilterPills';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

/**
 * VIEW - Home do FinUp (ver Figma).
 *
 * Nome, saldo total e entradas, saidas e movimentacoes do periodo escolhido vem do back
 * (useHomeViewModel). O filtro de tipo ('Todos' | 'Entrada' | 'Saida') filtra a listagem
 * de movimentacoes da Home de forma puramente reativa sem alterar o saldo ou totais.
 */
export default function HomeScreen() {
  const router = useRouter();
  const {
    status,
    userName,
    balance,
    income,
    expense,
    expenses,
    periodKey,
    periodLabel,
    setPeriodKey,
    typeFilter,
    setTypeFilter,
    refreshing,
    retry,
    refresh,
  } = useHomeViewModel();

  const sectionTitle =
    typeFilter === 'INCOME' ? 'Entradas' : typeFilter === 'EXPENSE' ? 'Gastos' : 'Movimentações';

  const emptyMessage =
    typeFilter === 'INCOME'
      ? 'Nenhuma entrada neste período.'
      : typeFilter === 'EXPENSE'
        ? 'Nenhum gasto neste período.'
        : undefined;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={darkColors.textMuted}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader onPressScore={() => {}} score="-" userName={userName} />

        <ScoreBannerCard onPressAdd={() => {}} />

        <BalanceCard
          balance={balance}
          expense={expense}
          income={income}
          onPressAdd={() => router.navigate('/transacao')}
          onRetry={retry}
          onSelectPeriod={setPeriodKey}
          period={periodLabel}
          periodKey={periodKey}
          status={status}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <TypeFilterPills onSelect={setTypeFilter} selected={typeFilter} />
          </View>
          <ExpenseList
            emptyMessage={emptyMessage}
            expenses={expenses}
            onPressIntegrate={() => {}}
            status={status}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  screen: {
    backgroundColor: darkColors.background,
    flex: 1,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: darkColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});