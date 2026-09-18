import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PillButton } from '@/components/ui/PillButton';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - card de CTA para integrar cartoes (secao "Gastos").
 *
 * O icone de maquininha e uma aproximacao (Feather "credit-card") - a
 * ilustracao exata do Figma nao pode ser extraida nesta tarefa.
 */
type IntegrateCardsCardProps = {
  onPressIntegrate: () => void;
};

export function IntegrateCardsCard({ onPressIntegrate }: IntegrateCardsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.textRow}>
        <Text style={styles.description}>
          Integre seus cartões para manter registro e acompanhar todos os seus gastos em um só
          lugar.
        </Text>
        <View style={styles.iconWrapper}>
          <Feather color={darkColors.textMuted} name="credit-card" size={28} />
        </View>
      </View>

      <PillButton icon="plus" label="Integrar cartões" onPress={onPressIntegrate} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkColors.surface,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  description: {
    color: darkColors.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
