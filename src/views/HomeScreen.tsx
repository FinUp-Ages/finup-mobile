import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '@/components/home/BalanceCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeTabBar, type TabKey } from '@/components/home/HomeTabBar';
import { IntegrateCardsCard } from '@/components/home/IntegrateCardsCard';
import { ScoreBannerCard } from '@/components/home/ScoreBannerCard';
import { darkColors } from '@/theme/colors';

/**
 * VIEW - Home do FinUp (ver Figma).
 *
 * Tela inteiramente mockada: nenhum card ou botao chama API ou navega de
 * verdade ainda - todo `onPress` e um ponto de integracao para tarefas
 * futuras (Etapa 2 do cadastro, saldo, integracao de cartoes, as demais abas
 * da navegacao). Nome do usuario e score sao placeholders ate existir sessao
 * e endpoint de score consumidos pelo app.
 */
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('carteira');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader onPressScore={() => {}} score="-" userName="Carlos" />

        <ScoreBannerCard onPressAdd={() => {}} />

        <BalanceCard onPressAdd={() => {}} period="Últimos 7 dias" />

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
