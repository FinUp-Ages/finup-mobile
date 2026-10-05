import { isLoaded } from 'expo-font';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { interFamilyFor } from '@/theme/fonts';

/**
 * COMPONENT - `Text` e `TextInput` do app, com a fonte Inter (ver theme/fonts).
 *
 * Mesma API do react-native: as telas importam daqui no lugar de
 * `react-native` e continuam usando `fontWeight` nos estilos, que vira a familia
 * Inter do peso certo. Estilo com `fontFamily` proprio fica como esta. Se a Inter
 * nao carregou (falha no app/_layout.tsx), segue a fonte do sistema.
 */
function withInter(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  if (flat?.fontFamily) return style;
  const family = interFamilyFor(flat?.fontWeight);
  if (!isLoaded(family)) return style;
  const { fontWeight: _fontWeight, ...rest } = flat ?? {};
  return [rest, { fontFamily: family }];
}

export function Text(props: TextProps) {
  return <RNText {...props} style={withInter(props.style)} />;
}

export function TextInput(props: TextInputProps) {
  return <RNTextInput {...props} style={withInter(props.style)} />;
}
