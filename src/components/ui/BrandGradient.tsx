import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - fundo da aba Transacao e do modal de transacao (Figma "add").
 *
 * Base marinho (`colors.navy`) com o brilho azul do topo (`colors.brandGlow`):
 * no Figma e uma elipse de 630px com blur 200 em (50%, 5%); aqui vira um
 * degrade radial com a mesma abertura, centrado a ~20% da altura da tela
 * (referencia 412x917). Ocupa todo o pai; quem usa coloca o conteudo por cima.
 */
export function BrandGradient() {
  return (
    <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
      <Defs>
        <RadialGradient cx="0.5" cy="0.2" id="brandGlow" rx="1.02" ry="0.6">
          <Stop offset="0" stopColor={colors.brandGlow} stopOpacity="0.9" />
          <Stop offset="0.45" stopColor={colors.brandGlow} stopOpacity="0.5" />
          <Stop offset="1" stopColor={colors.brandGlow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect fill={colors.navy} height="100%" width="100%" />
      <Rect fill="url(#brandGlow)" height="100%" width="100%" />
    </Svg>
  );
}
