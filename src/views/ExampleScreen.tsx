import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExampleCard } from '@/components/ExampleCard';
import { useExampleViewModel } from '@/viewmodels/useExampleViewModel';

/**
 * VIEW - a tela de verdade.
 *
 * Observa um ViewModel e distribui os dados para os componentes. Nao importa
 * Model, nao chama httpClient, nao tem regra de negocio.
 *
 * A rota que aponta para esta tela e src/app/index.tsx, que so faz o reexport.
 *
 * TODO: implementar em tarefa futura - substituir pelas telas reais do app.
 */
export default function ExampleScreen() {
  const { examples, loading, error, reload } = useExampleViewModel();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Exemplos</Text>
        <Pressable onPress={reload} style={styles.button}>
          <Text style={styles.buttonLabel}>Recarregar</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Tela de exemplo: View -&gt; ViewModel -&gt; Model -&gt; API. Descartavel.
      </Text>

      {loading ? <ActivityIndicator style={styles.spacer} /> : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error ? (
        <FlatList
          contentContainerStyle={styles.spacer}
          data={examples}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExampleCard example={item} />}
        />
      ) : null}

      <Link href="/profile" style={styles.link}>
        Ir para o perfil
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonLabel: {
    color: '#0f172a',
    fontSize: 13,
  },
  error: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderRadius: 8,
    borderWidth: 1,
    color: '#92400e',
    marginTop: 24,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '600',
  },
  link: {
    color: '#2563eb',
    paddingVertical: 16,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  spacer: {
    marginTop: 24,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
});
