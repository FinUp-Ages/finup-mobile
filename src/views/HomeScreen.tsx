import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '@/components/home/BalanceCard';
import { ExpenseList } from '@/components/home/ExpenseList';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ScoreBannerCard } from '@/components/home/ScoreBannerCard';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

/**
 * VIEW - Home do FinUp (ver Figma).
 *
 * Nome, saldo total e entradas, saidas e gastos do periodo escolhido vem do back
 * (useHomeViewModel). Ainda mockados: score e os CTAs "Adicionar agora" e
 * "Integrar cartoes" - o `onPress` deles e ponto de integracao para tarefas
 * futuras. A barra de baixo e a de abas nativa, de app/(tabs)/_layout.tsx.
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
          <Text style={styles.sectionTitle}>Gastos</Text>
          <ExpenseList expenses={expenses} onPressIntegrate={() => {}} status={status} />
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
  sectionTitle: {
    color: darkColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
