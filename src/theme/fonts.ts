import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { createElement, type ComponentType } from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

/**
 * Fonte do app: Inter. No React Native cada peso e uma familia propria, entao os
 * pesos (`fontWeight`) dos estilos existentes sao traduzidos para a familia certa
 * em `applyInterFont`, sem precisar mexer em cada componente.
 */
export const interFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
};

function familyFor(weight: unknown): string {
  switch (String(weight ?? '400')) {
    case '500':
      return 'Inter_500Medium';
    case '600':
      return 'Inter_600SemiBold';
    case '700':
    case 'bold':
      return 'Inter_700Bold';
    case '800':
    case '900':
      return 'Inter_800ExtraBold';
    default:
      return 'Inter_400Regular';
  }
}

let applied = false;

function withInter<P extends { style?: StyleProp<TextStyle> }>(Base: ComponentType<P>) {
  function InterComponent(props: P) {
    const flat = StyleSheet.flatten(props.style) as TextStyle | undefined;
    if (flat?.fontFamily) return createElement(Base, props);
    const { fontWeight, ...rest } = flat ?? {};
    return createElement(Base, { ...props, style: [rest, { fontFamily: familyFor(fontWeight) }] });
  }
  InterComponent.displayName = Base.displayName ?? Base.name;
  return InterComponent;
}

/**
 * Chamar uma vez, depois que as fontes carregarem. Troca `Text` e `TextInput`
 * exportados pelo react-native; os imports `{ Text } from 'react-native'` leem a
 * propriedade a cada render, entao pegam as versoes com Inter.
 */
export function applyInterFont() {
  if (applied) return;
  applied = true;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rn = require('react-native') as Record<string, unknown>;
  const InterText = withInter(RNText as ComponentType<TextProps>);
  const InterTextInput = withInter(RNTextInput as ComponentType<TextInputProps>);
  Object.defineProperty(rn, 'Text', { configurable: true, enumerable: true, get: () => InterText });
  Object.defineProperty(rn, 'TextInput', {
    configurable: true,
    enumerable: true,
    get: () => InterTextInput,
  });
}
