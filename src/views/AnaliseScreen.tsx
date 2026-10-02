import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-screens/experimental';
import { TransactionModal } from '@/components/common/TransactionModal';
import { BrandGradient } from '@/components/ui/BrandGradient';
import { PillButton } from '@/components/ui/PillButton';
import { colors } from '@/theme/colors';
import { formatAmount } from '@/utils/masks';
import { useAnaliseViewModel } from '@/viewmodels/useAnaliseViewModel';

/**
 * VIEW - tela de Analise (mockup "Adicionar transacao", primeira tela).
 *
 * Saldo total no centro e os botoes Entrada/Saida embaixo, que abrem o
 * TransactionModal por cima desta tela. Cada botao abre o modal ja com o seu
 * tipo: Entrada mostra so "Salvar entrada" e as categorias de entrada, Saida o
 * mesmo para saida. Graficos, o seletor do saldo e a edicao do saldo total sao
 * escopo futuro.
 */
export default function AnaliseScreen() {
  const insets = useSafeAreaInsets();
  const {
    balance,
    balanceValue,
    retryBalance,
    modalVisible,
    modalType,
    openModal,
    closeModal,
    onTransactionSaved,
  } = useAnaliseViewModel();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BrandGradient />

      {/* SafeAreaView do react-native-screens: respeita a barra de abas nativa
          (no iOS 26 ela flutua por cima do conteudo), o que o useSafeAreaInsets
          nao enxerga. O degrade acima continua indo ate o fim da tela. */}
      <SafeAreaView edges={{ bottom: true }} style={styles.safeArea}>
        {/* Com o modal aberto por cima, o leitor de tela ignora o conteudo de tras. */}
        <View
          accessibilityElementsHidden={modalVisible}
          importantForAccessibility={modalVisible ? 'no-hide-descendants' : 'auto'}
          style={[styles.content, { paddingTop: insets.top + 24 }]}
        >
          <View style={styles.balanceArea}>
            <View style={styles.balanceChip}>
              <Text style={styles.balanceChipText}>Saldo total</Text>
            </View>
            {balance.status === 'loading' ? (
              <ActivityIndicator color={colors.white} style={styles.balanceLoading} />
            ) : balance.status === 'error' ? (
              <View style={styles.balanceError}>
                <Text selectable style={styles.balanceErrorText}>
                  Não foi possível carregar o saldo.
                </Text>
                <Pressable accessibilityRole="button" hitSlop={12} onPress={retryBalance}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : (
              <Text selectable style={styles.balanceValue}>
                {formatAmount(balance.value)}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <Text style={styles.actionsTitle}>Registre uma transação</Text>
            <PillButton
              icon="plus"
              label="Entrada"
              onPress={() => openModal('INCOME')}
              variant="light"
            />
            <PillButton
              icon="minus"
              label="Saída"
              onPress={() => openModal('EXPENSE')}
              variant="dark"
            />
          </View>
        </View>

        <TransactionModal
          balance={balanceValue}
          onClose={closeModal}
          onSuccess={onTransactionSaved}
          type={modalType}
          visible={modalVisible}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    paddingBottom: 24,
  },
  actionsTitle: {
    color: colors.white,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  balanceArea: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  balanceChip: {
    backgroundColor: colors.glassStrong,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  balanceChipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  balanceError: {
    alignItems: 'center',
    gap: 6,
  },
  balanceErrorText: {
    color: colors.errorOnDark,
    fontSize: 14,
  },
  // Mesma altura do valor, para o layout nao pular quando o saldo chega.
  balanceLoading: {
    height: 34,
  },
  balanceValue: {
    color: colors.white,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  retryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    backgroundColor: colors.brandDeep,
    flex: 1,
  },
});
