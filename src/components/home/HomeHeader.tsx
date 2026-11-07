import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { darkColors } from '@/theme/colors';

/**
 * COMPONENT - cabecalho da Home: avatar + saudacao + badge de score.
 *
 * `userName` vem do GET /users/me (null enquanto carrega ou se falhar: a
 * saudacao fica so "Ola!"). `score` e o FinUp Score (0 a 100) do GET /users/me ja
 * formatado ("-" enquanto carrega, se falhar ou se ainda nao foi calculado).
 * `onPressScore` e ponto de integracao futuro (ex.: abrir o detalhe do FinUp Score).
 */
type HomeHeaderProps = {
  onPressProfile: () => void;
  userName: string | null;
  score: string;
  onPressScore: () => void;
};

export function HomeHeader({ onPressProfile, userName, score, onPressScore }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <Pressable
          accessibilityLabel="Abrir perfil"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onPressProfile}
          style={({ pressed }) => [styles.avatar, pressed ? styles.avatarPressed : null]}
        >
          <Feather color={darkColors.textMuted} name="user" size={20} />
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>Sua conta</Text>
          <Text style={styles.greeting}>{userName ? `Olá, ${userName}!` : 'Olá!'}</Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel={score === '-' ? 'FinUp Score indisponível' : `FinUp Score ${score}`}
        accessibilityRole="button"
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
  avatarPressed: {
    opacity: 0.8,
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
