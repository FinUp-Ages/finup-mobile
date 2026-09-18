import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - barra de navegacao inferior da Home.
 *
 * Puramente visual: so troca o item "ativo" localmente, sem navegar de
 * verdade. Carteira, Analise, Educacional e Chatbot nao tem tela implementada
 * ainda - "Transacao" tampouco abre o fluxo de registro de transacao. Ligar
 * cada item a rota real e trabalho futuro, fora do escopo desta tela.
 */
type TabKey = 'carteira' | 'analise' | 'transacao' | 'educacional' | 'chatbot';

const TABS: { key: TabKey; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'carteira', label: 'Carteira', icon: 'credit-card' },
  { key: 'analise', label: 'Análise', icon: 'bar-chart-2' },
  { key: 'transacao', label: 'Transação', icon: 'plus' },
  { key: 'educacional', label: 'Educacional', icon: 'book-open' },
  { key: 'chatbot', label: 'Chatbot', icon: 'message-circle' },
];

type HomeTabBarProps = {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
};

export function HomeTabBar({ activeTab, onSelectTab }: HomeTabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const isTransacao = tab.key === 'transacao';

        return (
          <Pressable key={tab.key} onPress={() => onSelectTab(tab.key)} style={styles.item}>
            <View
              style={[
                styles.iconCircle,
                isTransacao ? styles.iconCircleAccent : null,
                isActive && !isTransacao ? styles.iconCircleActive : null,
              ]}
            >
              <Feather
                color={isActive || isTransacao ? '#ffffff' : darkColors.textFaint}
                name={tab.icon}
                size={18}
              />
            </View>
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { TabKey };

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginBottom: 4,
    width: 32,
  },
  iconCircleAccent: {
    backgroundColor: darkColors.accent,
  },
  iconCircleActive: {
    backgroundColor: 'rgba(47, 128, 255, 0.25)',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: darkColors.textFaint,
    fontSize: 10,
    fontWeight: '600',
  },
  labelActive: {
    color: darkColors.accent,
  },
});
