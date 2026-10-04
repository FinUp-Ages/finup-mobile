import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, darkColors } from '@/theme/colors';

/**
 * COMPONENT - banner do score (Figma "banner": 371x152, raio 10).
 *
 * Fundo em degrade radial (azul-claro no canto inferior esquerdo -> azul
 * profundo), medalha a direita (assets/home/score-medal.png, exportada do
 * Figma) e o botao "Adicionar agora". `onPressAdd` e ponto de integracao futuro.
 */
type ScoreBannerCardProps = {
  onPressAdd: () => void;
};

const HEIGHT = 152;

export function ScoreBannerCard({ onPressAdd }: ScoreBannerCardProps) {
  return (
    <View style={styles.card}>
      <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
        <Defs>
          <RadialGradient cx="0" cy="1" fx="0" fy="1" id="bannerGradient" rx="1" ry="1.4725">
            <Stop offset="0" stopColor={darkColors.scoreBannerLight} />
            <Stop offset="1" stopColor={darkColors.scoreBannerDeep} />
          </RadialGradient>
        </Defs>
        <Rect fill="url(#bannerGradient)" height="100%" width="100%" />
      </Svg>

      {/* Medalha: caixa de 231px a direita; imagem 261px girada 13,44 graus, como no Figma. */}
      <View pointerEvents="none" style={styles.medalBox}>
        <Image
          accessibilityIgnoresInvertColors
          source={require('../../../assets/home/score-medal.png')}
          style={styles.medal}
        />
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.subtitle}>Adicione suas informações</Text>
          <Text style={styles.title}>e aumente seu score</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onPressAdd}
          style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
        >
          <Text style={styles.buttonLabel}>Adicionar agora</Text>
          <Feather color={colors.navy} name="arrow-right" size={16} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: darkColors.scoreBannerButton,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  buttonLabel: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.32,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  card: {
    borderRadius: 10,
    height: HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    gap: 18,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  medal: {
    height: 261,
    left: 26.77,
    position: 'absolute',
    top: -65.35,
    transform: [{ rotate: '13.4417deg' }],
    width: 261,
  },
  medalBox: {
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 231,
  },
  subtitle: {
    color: colors.navy,
    fontSize: 16,
    letterSpacing: 0.32,
  },
  title: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
