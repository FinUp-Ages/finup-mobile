import { StyleSheet, Text, View } from 'react-native';
import type { Example } from '@/types/example';

/**
 * COMPONENT - componente de UI passivo.
 *
 * Recebe tudo por props. Nao busca dado, nao chama ViewModel nem Model, nao
 * conhece rota. Se precisar de dado, quem passa e a View.
 */
type ExampleCardProps = {
  example: Example;
};

export function ExampleCard({ example }: ExampleCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{example.name}</Text>
      <Text style={styles.description}>{example.description}</Text>
      <Text style={styles.id}>id: {example.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  description: {
    color: '#475569',
    fontSize: 14,
    marginTop: 4,
  },
  id: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 12,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
});
