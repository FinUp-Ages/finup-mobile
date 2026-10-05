import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - cabecalho fixo do fluxo de cadastro: "X" para fechar, titulo, e
 * "< Voltar" abaixo (opcional, escondido na primeira etapa via onBack ausente).
 *
 * Passivo: as acoes de fechar/voltar sao responsabilidade de quem usa (a View).
 */
type CadastroHeaderProps = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
};

export function CadastroHeader({ title, onClose, onBack }: CadastroHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.row}>
        <Pressable hitSlop={12} onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>

      {onBack ? (
        <Pressable hitSlop={12} onPress={onBack} style={styles.backRow}>
          <Feather name="chevron-left" size={18} color={colors.textDark} />
          <Text style={styles.backLabel}>Voltar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backLabel: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 2,
  },
  backRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  container: {
    paddingBottom: 4,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.disabledIcon,
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    width: 44,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'space-between',
  },
  spacer: {
    width: 36,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
