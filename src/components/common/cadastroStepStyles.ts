import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * Estilos compartilhados entre os componentes de etapa do cadastro
 * (CadastroStepDados, CadastroStepAdicionais, CadastroStepSenha) - as tres
 * seguem o mesmo layout de titulo + subtitulo + lista de campos.
 */
export const styles = StyleSheet.create({
  fields: {
    marginTop: 24,
  },
  hint: {
    color: colors.placeholder,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
  },
});
