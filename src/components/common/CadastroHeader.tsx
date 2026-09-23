import { Pressable, StyleSheet, Text, View } from 'react-native';
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
    <View>
      <View style={styles.row}>
        <Pressable hitSlop={12} onPress={onClose} style={styles.closeButton}>
          <Text style={styles.close}>×</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>

      {onBack ? (
        <Pressable hitSlop={12} onPress={onBack} style={styles.backRow}>
          <Text style={styles.backLabel}>‹ Voltar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  backRow: {
    marginTop: 16,
  },
  close: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '400',
  },
  closeButton: {
    alignItems: 'center',
    width: 32,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  spacer: {
    width: 32,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
