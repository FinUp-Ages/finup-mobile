import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { useProfileViewModel } from '@/viewmodels/useProfileViewModel';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/colors';
import { investorProfileLabels } from '@/types/triage';

/**
 * VIEW - tela de perfil do usuario final.
 *
 * A rota que aponta para esta tela e app/profile.tsx (fora da barra de abas).
 *
 * Consulta a avaliação da triagem e abre o questionário fora da barra de abas.
 */
export default function ProfileScreen() {
  const { signingOut, signOut, assessment, loading, loadError, retry, openTriage } = useProfileViewModel();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Perfil de investidor</Text>
        {loading ? <ActivityIndicator color={colors.navy} /> : loadError ? <>
          <Text style={styles.subtitle}>Não foi possível consultar seu perfil.</Text>
          <PrimaryButton label="Tentar novamente" onPress={retry} />
        </> : <>
          <Text style={styles.subtitle}>{assessment
            ? `Seu perfil é ${investorProfileLabels[assessment.assessment.profile].toLowerCase()}. Consulte sua avaliação ou atualize suas respostas.`
            : 'Conheça seu perfil e receba orientações a partir da sua realidade financeira.'}</Text>
          <PrimaryButton label={assessment ? 'Ver meu perfil de investidor' : 'Fazer perfil de investidor'} onPress={openTriage} />
        </>}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={signingOut}
        onPress={signOut}
        style={styles.signOutButton}
      >
        {signingOut ? (
          <ActivityIndicator color="#dc2626" size="small" />
        ) : (
          <Text style={styles.signOutLabel}>Sair</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, gap: 16, marginTop: 24 },
  cardTitle: { color: colors.navy, fontSize: 20, fontWeight: '600' },
  heading: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '600',
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    paddingVertical: 16,
  },
  signOutLabel: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
});
