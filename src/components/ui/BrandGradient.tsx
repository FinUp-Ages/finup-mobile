import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * COMPONENT - fundo da aba Transacao e do modal de transacao (Figma "add").
 *
 * Base marinho #021736 com o brilho azul do topo: no Figma e uma elipse de 630px
 * (#1C93D7, blur 200) (50%, 5%) no Figma; aqui desce para ~20% da tela de 412x917; aqui vira um
 * degrade radial com a mesma abertura. Ocupa todo o pai; quem usa coloca o
 * conteudo por cima.
 */
export function BrandGradient() {
  return (
    <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
      <Defs>
        <RadialGradient cx="0.5" cy="0.2" id="brandGlow" rx="1.02" ry="0.6">
          <Stop offset="0" stopColor="#1C93D7" stopOpacity="0.9" />
          <Stop offset="0.45" stopColor="#1C93D7" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#1C93D7" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect fill="#021736" height="100%" width="100%" />
      <Rect fill="url(#brandGlow)" height="100%" width="100%" />
    </Svg>
  );
}
