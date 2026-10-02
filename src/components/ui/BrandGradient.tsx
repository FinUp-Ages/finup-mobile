import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - fundo em degrade azul da tela Analise e do modal de transacao
 * (mockup). Ocupa todo o pai; quem usa coloca o conteudo por cima.
 */
export function BrandGradient() {
  return (
    <LinearGradient
      colors={[colors.brandBlue, colors.brandDeep, colors.brandDeep]}
      end={{ x: 0.5, y: 1 }}
      locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
