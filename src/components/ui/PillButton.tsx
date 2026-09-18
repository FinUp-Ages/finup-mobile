import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - botao pilula claro com icone circular a direita.
 *
 * Mesma estrutura visual do PrimaryButton (rotulo + circulo de icone), so que
 * com as cores invertidas (fundo claro, circulo escuro) - e o padrao usado nos
 * cards da Home ("Adicionar agora", "Adicionar informacoes", "Integrar
 * cartoes"). Passivo: quem chama decide o que o onPress faz - hoje e sempre
 * mockado, ponto de integracao futura.
 */
type PillButtonProps = {
  label: string;
  onPress: () => void;
  icon?: 'plus' | 'arrow-right';
};

export function PillButton({ label, onPress, icon = 'plus' }: PillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.iconCircle}>
        <Feather color="#ffffff" name={icon} size={14} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: darkColors.background,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  label: {
    color: darkColors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
