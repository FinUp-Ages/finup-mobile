import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '@/components/home/BalanceCard';
import { ExpenseList } from '@/components/home/ExpenseList';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeTabBar, type TabKey } from '@/components/home/HomeTabBar';
import { ScoreBannerCard } from '@/components/home/ScoreBannerCard';
import { darkColors } from '@/theme/colors';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

/**
 * VIEW - Home do FinUp (ver Figma).
 *
 * Nome, saldo total e gastos do mes corrente vem do back (useHomeViewModel).
 * Ainda mockados: score, os CTAs (Adicionar agora, Adicionar informacoes,
 * Integrar cartoes) e a barra inferior - todo `onPress` deles e ponto de
 * integracao para tarefas futuras.
 */
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('carteira');
  const {
    status,
    userName,
    balance,
    hasTransactions,
    expenses,
    periodLabel,
    refreshing,
    retry,
    refresh,
  } = useHomeViewModel();

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
          onPressAdd={() => {}}
          onRetry={retry}
          period={periodLabel}
          showAddHint={!hasTransactions}
          status={status}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos</Text>
          <ExpenseList expenses={expenses} onPressIntegrate={() => {}} status={status} />
        </View>
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <HomeTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </View>
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
  sectionTitle: {
    color: darkColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tabBarWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
