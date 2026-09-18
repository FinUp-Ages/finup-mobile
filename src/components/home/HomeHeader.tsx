import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - cabecalho da Home: avatar + saudacao + badge de score.
 *
 * `userName` e `score` sao mockados por enquanto - nao ha sessao nem endpoint
 * de score consumido ainda. `onPressScore` e ponto de integracao futuro (ex.:
 * abrir o detalhe do FinUp Score).
 */
type HomeHeaderProps = {
  userName: string;
  score: string;
  onPressScore: () => void;
};

export function HomeHeader({ userName, score, onPressScore }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Feather color={darkColors.textMuted} name="user" size={20} />
        </View>
        <View>
          <Text style={styles.eyebrow}>Sua conta</Text>
          <Text style={styles.greeting}>Olá, {userName}!</Text>
        </View>
      </View>

      <Pressable
        onPress={onPressScore}
        style={({ pressed }) => [styles.scoreBadge, pressed ? styles.scoreBadgePressed : null]}
      >
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: darkColors.textMuted,
    fontSize: 12,
  },
  greeting: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderColor: darkColors.surfaceBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreBadgePressed: {
    opacity: 0.8,
  },
  scoreLabel: {
    color: darkColors.textMuted,
    fontSize: 12,
  },
  scoreValue: {
    color: darkColors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
