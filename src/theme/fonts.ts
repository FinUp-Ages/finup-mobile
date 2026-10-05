import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

/**
 * Fonte do app: Inter, carregada em app/_layout.tsx. No React Native cada peso e
 * uma familia propria, entao o `Text`/`TextInput` de components/ui/AppText traduz
 * o `fontWeight` dos estilos para a familia certa com `interFamilyFor`.
 */
export const interFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
};

export function interFamilyFor(weight: unknown): keyof typeof interFonts {
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
