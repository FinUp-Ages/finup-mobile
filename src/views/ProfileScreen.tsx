import { StyleSheet, Text, View } from 'react-native';

/**
 * VIEW - tela de perfil do usuario final.
 *
 * A rota que aponta para esta tela e src/app/(tabs)/profile.tsx.
 *
 * TODO: implementar em tarefa futura - dados reais do perfil.
 */
export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Perfil</Text>
      <Text style={styles.subtitle}>
        Tela de exemplo. A logica visual mora em views/, nunca em app/.
      </Text>
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
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
});
