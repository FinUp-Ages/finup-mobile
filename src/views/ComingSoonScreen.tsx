import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandGradient } from '@/components/ui/BrandGradient';
import { colors } from '@/theme/colors';

/**
 * VIEW - aba da barra que ainda nao tem tela (Carteira, Analise,
 * Educacional). Mantem o fundo da aba Transacao para a navegacao entre abas
 * nao piscar; cada aba ganha a tela de verdade na tarefa dela.
 */
type ComingSoonScreenProps = {
  title: string;
};

export default function ComingSoonScreen({ title }: ComingSoonScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BrandGradient />
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>Em breve.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  screen: {
    backgroundColor: colors.brandDeep,
    flex: 1,
  },
  subtitle: {
    color: colors.white,
    fontSize: 15,
    opacity: 0.8,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
});
