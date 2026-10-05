import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { useProfileViewModel } from '@/viewmodels/useProfileViewModel';

/**
 * VIEW - tela de perfil do usuario final.
 *
 * A rota que aponta para esta tela e app/profile.tsx (fora da barra de abas).
 *
 * TODO: implementar em tarefa futura - dados reais do perfil.
 */
export default function ProfileScreen() {
  const { signingOut, signOut } = useProfileViewModel();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Perfil</Text>
      <Text style={styles.subtitle}>
        Tela de exemplo. A logica visual mora em views/, nunca em app/.
      </Text>

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
