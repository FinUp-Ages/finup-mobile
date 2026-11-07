import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { investorProfileLabels, type AssessmentResponse } from '@/types/triage';

const severityLabels = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta' };

export function TriageAssessment({ result }: { result: AssessmentResponse }) {
  const { assessment, completedAt } = result;
  return <View style={styles.content}>
    <Feather name="check-circle" size={36} color={colors.navy} />
    <Text style={styles.caption}>Seu perfil de investidor</Text>
    <Text accessibilityRole="header" style={styles.title}>{investorProfileLabels[assessment.profile]}</Text>
    <Text style={styles.body}>{assessment.summary}</Text>
    <Text style={styles.caption}>Atualizado em {new Date(completedAt).toLocaleDateString('pt-BR')}</Text>
    <Text accessibilityRole="header" style={styles.heading}>Pontos de atenção</Text>
    {assessment.risks.length === 0 ? <Text style={styles.body}>Nenhum ponto de atenção identificado.</Text> : null}
    {assessment.risks.map((risk) => <View key={risk.code} style={styles.card}>
      <Text style={styles.caption}>Prioridade {severityLabels[risk.severity].toLowerCase()}</Text>
      <Text style={styles.heading}>{risk.title}</Text>
      <Text style={styles.body}>{risk.description}</Text>
      <Text style={styles.suggestion}>{risk.suggestion}</Text>
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingVertical: 20 },
  title: { color: colors.navy, fontSize: 28, fontWeight: '600' },
  heading: { color: colors.navy, fontSize: 18, fontWeight: '600' },
  caption: { color: colors.textSecondary, fontSize: 13 },
  body: { color: colors.navy, fontSize: 15, lineHeight: 23 },
  suggestion: { color: colors.navy, fontSize: 15, fontWeight: '500', lineHeight: 23 },
  card: { backgroundColor: colors.inputBackground, borderRadius: 10, padding: 16, gap: 10 },
});
