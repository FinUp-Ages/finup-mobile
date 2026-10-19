import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnaliseAlerta } from '@/components/analise/AnaliseAlerta';
import { AnaliseGastoCategorias } from '@/components/analise/AnaliseGastoCategorias';
import { AnaliseMovimentacoes } from '@/components/analise/AnaliseMovimentacoes';
import { AnaliseMovimentacoesModal } from '@/components/analise/AnaliseMovimentacoesModal';
import { Text } from '@/components/ui/AppText';
import { colors, darkColors } from '@/theme/colors';
import { useAnaliseViewModel } from '@/viewmodels/useAnaliseViewModel';

/** VIEW - aba Análise: Transações, gastos por categoria e alerta. */
export default function AnaliseScreen() {
  const viewModel = useAnaliseViewModel();
  const [movementsModalOpen, setMovementsModalOpen] = useState(false);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={viewModel.refresh}
            refreshing={viewModel.refreshing}
            tintColor={darkColors.textMuted}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <AnaliseHeader />
        <AnaliseAlerta />
        {viewModel.status === 'loading' ? <LoadingState /> : null}
        {viewModel.status === 'error' ? <ErrorState onRetry={viewModel.retry} /> : null}
        {viewModel.status === 'sessionExpired' ? <SessionExpiredState /> : null}
        {viewModel.status === 'success' ? (
          <>
            <AnaliseMovimentacoes
              movements={viewModel.movements}
              onPressViewMore={() => setMovementsModalOpen(true)}
              onSelectPeriod={viewModel.setPeriodKey}
              onSelectSortOrder={viewModel.setSortOrder}
              periodKey={viewModel.periodKey}
              periodLabel={viewModel.periodLabel}
              sortOrder={viewModel.sortOrder}
            />
            <AnaliseGastoCategorias
              expenses={viewModel.categoryExpenses}
              total={viewModel.categoryTotal}
            />
          </>
        ) : null}
      </ScrollView>
      <AnaliseMovimentacoesModal
        movements={viewModel.movements}
        onClose={() => setMovementsModalOpen(false)}
        onSelectPeriod={viewModel.setPeriodKey}
        onSelectSortOrder={viewModel.setSortOrder}
        periodKey={viewModel.periodKey}
        periodLabel={viewModel.periodLabel}
        sortOrder={viewModel.sortOrder}
        visible={movementsModalOpen}
      />
    </SafeAreaView>
  );
}

function AnaliseHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <Feather color={darkColors.textMuted} name="user" size={21} />
      </View>
      <View>
        <Text style={styles.eyebrow}>Sua conta</Text>
        <Text style={styles.title}>Análise personalizada</Text>
      </View>
    </View>
  );
}

function LoadingState() {
  return (
    <View accessibilityLiveRegion="polite" style={styles.feedback}>
      <ActivityIndicator accessibilityLabel="Carregando análise" color={darkColors.textPrimary} />
      <Text style={styles.feedbackText}>Carregando sua análise…</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.feedback}>
      <Feather color={darkColors.expenseText} name="alert-circle" size={24} />
      <Text style={styles.feedbackTitle}>Não foi possível carregar sua análise.</Text>
      <Text style={styles.feedbackText}>Verifique sua conexão e tente novamente.</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retry, pressed ? styles.pressed : null]}
      >
        <Text style={styles.retryText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

function SessionExpiredState() {
  return (
    <View accessibilityLiveRegion="polite" style={styles.feedback}>
      <Text style={styles.feedbackTitle}>Sua sessão expirou.</Text>
      <Text style={styles.feedbackText}>Você será redirecionado para entrar novamente.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 28, paddingBottom: 24, paddingHorizontal: 16, paddingTop: 16 },
  eyebrow: { color: darkColors.textMuted, fontSize: 12 },
  feedback: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    minHeight: 196,
    justifyContent: 'center',
    padding: 24,
  },
  feedbackText: { color: darkColors.textMuted, fontSize: 13, textAlign: 'center' },
  feedbackTitle: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  pressed: { opacity: 0.75 },
  retry: {
    backgroundColor: darkColors.textPrimary,
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: { color: darkColors.background, fontSize: 14, fontWeight: '700' },
  screen: { backgroundColor: colors.navy, flex: 1 },
  title: { color: darkColors.textPrimary, fontSize: 16, fontWeight: '700' },
});
