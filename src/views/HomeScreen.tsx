import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '@/components/home/BalanceCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeTabBar, type TabKey } from '@/components/home/HomeTabBar';
import { IntegrateCardsCard } from '@/components/home/IntegrateCardsCard';
import { ScoreBannerCard } from '@/components/home/ScoreBannerCard';
import { TransactionList } from '@/components/home/TransactionList';
import { darkColors } from '@/theme/colors';
import { formatTransactionDate } from '@/utils/transactions';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

/**
 * VIEW - Home do FinUp (ver Figma).
 *
 * Saldo, transacoes e nome reais. Score, integracao de cartoes e a barra
 * interna de navegacao ainda aguardam suas respectivas integracoes.
 */
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('carteira');
  const { state, userName, period, reload, resumeRegistration, signIn } = useHomeViewModel();
  const loading = state.status === 'loading';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[darkColors.accent]}
            onRefresh={reload}
            refreshing={loading}
            tintColor={darkColors.textPrimary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader onPressScore={() => {}} score="-" userName={userName} />

        <ScoreBannerCard onPressAdd={() => {}} />

        <BalanceCard
          balance={state.status === 'success' ? state.data.balance : null}
          period="Últimos 7 dias"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transações</Text>
          <Text style={styles.period}>
            {formatTransactionDate(period.from)} a {formatTransactionDate(period.to)}
          </Text>
          {loading && (
            <View accessibilityLiveRegion="polite" style={styles.feedback}>
              <ActivityIndicator color={darkColors.accent} />
              <Text style={styles.feedbackText}>Carregando transações...</Text>
            </View>
          )}
          {state.status === 'error' && (
            <View accessibilityLiveRegion="polite" style={styles.feedback}>
              <Text style={styles.feedbackText}>{state.message}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={
                  state.httpStatus === 404
                    ? resumeRegistration
                    : state.httpStatus === 401
                      ? signIn
                      : reload
                }
                style={styles.retryButton}
              >
                <Text style={styles.retryLabel}>
                  {state.httpStatus === 404
                    ? 'Concluir cadastro'
                    : state.httpStatus === 401
                      ? 'Entrar novamente'
                      : 'Tentar novamente'}
                </Text>
              </Pressable>
            </View>
          )}
          {state.status === 'success' && <TransactionList transactions={state.data.transactions} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos</Text>
          <IntegrateCardsCard onPressIntegrate={() => {}} />
        </View>
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <HomeTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  feedback: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  feedbackText: {
    color: darkColors.textMuted,
    textAlign: 'center',
  },
  period: {
    color: darkColors.textMuted,
    fontSize: 12,
  },
  retryButton: {
    backgroundColor: darkColors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryLabel: {
    color: darkColors.textPrimary,
    fontWeight: '600',
  },
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
