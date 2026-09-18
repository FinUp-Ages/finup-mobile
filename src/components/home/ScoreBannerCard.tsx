import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { PillButton } from '@/components/ui/PillButton';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - card de CTA para completar o perfil e aumentar o FinUp Score.
 *
 * O icone de medalha e uma aproximacao (Feather "award") - a ilustracao exata
 * do Figma nao pode ser extraida nesta tarefa (ver nota na entrega).
 */
type ScoreBannerCardProps = {
  onPressAdd: () => void;
};

export function ScoreBannerCard({ onPressAdd }: ScoreBannerCardProps) {
  return (
    <LinearGradient
      colors={darkColors.scoreCardGradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.textColumn}>
        <Text style={styles.title}>Adicione suas informações{'\n'}e aumente seu score</Text>
        <View style={styles.buttonWrapper}>
          <PillButton icon="arrow-right" label="Adicionar agora" onPress={onPressAdd} />
        </View>
      </View>

      <View style={styles.medalGlow}>
        <Feather color="#8FD3FF" name="award" size={56} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  card: {
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  medalGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    opacity: 0.9,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
});
