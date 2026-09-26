import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TransactionModal } from '@/components/common/TransactionModal';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

/**
 * VIEW - tela de Analise (versao minima mockada).
 *
 * A issue original presumia que "Analise" ja existia com botoes
 * Entrada/Saida mockados - nao existia em nenhuma branch do repo. Esta e
 * so a base necessaria pra abrigar o TransactionModal; graficos, saldo real
 * e o restante do layout do Figma sao escopo futuro.
 *
 * `refreshCount` e um contador mock (nao ha estado global de saldo no app
 * ainda) - so demonstra que a tela reage a `onSuccess` do modal. Quando o
 * saldo real existir, essa callback vira um refetch de verdade sem mudar o
 * TransactionModal.
 */
export default function AnaliseScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Análise</Text>
      <Text style={styles.subtitle}>
        Tela mínima mockada - saldo e gráficos são escopo futuro.
      </Text>
      <Text style={styles.mockBalance}>Saldo (mock) atualizado {refreshCount}x</Text>

      <View style={styles.actions}>
        <PrimaryButton label="Entrada" onPress={() => setModalVisible(true)} />
        <PrimaryButton label="Saída" onPress={() => setModalVisible(true)} />
      </View>

      <TransactionModal
        onClose={() => setModalVisible(false)}
        onSuccess={() => setRefreshCount((prev) => prev + 1)}
        visible={modalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 24,
  },
  heading: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '600',
  },
  mockBalance: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 16,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
});
