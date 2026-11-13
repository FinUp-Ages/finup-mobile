import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - banner "Tipo Duolingo, mas para finanças" (Figma "banner": 371x152, raio 10).
 *
 * Degrade radial azul -> marinho (canto inferior esquerdo), pilha de livros de vidro a
 * direita e o botao "Comece agora". O banner inteiro e a area de toque e chama `onPress`
 * (a Home abre a aba Educacional).
 *
 * A pilha de livros ("Iridescent Glass Book Stack") e a arte exportada do Figma:
 * assets/home/book-stack.png.
 */
type LearningBannerCardProps = {
  onPress: () => void;
};

const HEIGHT = 152;

export function LearningBannerCard({ onPress }: LearningBannerCardProps) {
  return (
    <Pressable
      accessibilityHint="Abre a trilha de educação financeira"
      accessibilityLabel="Tipo Duolingo, mas para finanças. Comece agora"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
    >
      <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
        <Defs>
          <RadialGradient cx="0" cy="1" fx="0" fy="1" id="learningGradient" rx="1" ry="1.35">
            <Stop offset="0" stopColor={darkColors.learningBannerLight} />
            <Stop offset="1" stopColor={darkColors.learningBannerDeep} />
          </RadialGradient>
        </Defs>
        <Rect fill="url(#learningGradient)" height="100%" width="100%" />
      </Svg>

      {/* Pilha de livros: PNG exportado do Figma (418x304 = 209x152 em @2x), colado no canto direito. */}
      <Image
        accessibilityIgnoresInvertColors
        pointerEvents="none"
        source={require('../../../assets/home/book-stack.png')}
        style={styles.books}
      />

      <View style={styles.content}>
        <View>
          <Text style={styles.subtitle}>Tipo Duolingo, mas</Text>
          <Text style={styles.title}>para finanças</Text>
        </View>

        <View style={styles.button}>
          <Text style={styles.buttonLabel}>Comece agora</Text>
          <Feather color={darkColors.textPrimary} name="arrow-right" size={16} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  books: {
    height: HEIGHT,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 209,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: darkColors.learningBannerButton,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  buttonLabel: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.32,
  },
  card: {
    borderRadius: 10,
    height: HEIGHT,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
  },
  content: {
    flex: 1,
    gap: 18,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: darkColors.learningBannerSubtitle,
    fontSize: 16,
    letterSpacing: 0.32,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
