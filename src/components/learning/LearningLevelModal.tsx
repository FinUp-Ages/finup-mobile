import { Feather } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LearningButton } from '@/components/learning/LearningButton';
import { Text } from '@/components/ui/AppText';
import { colors, learningColors } from '@/theme/colors';
import type { StudyLevel } from '@/types/studyTrack';
import { learningContent, questionHeading } from '@/utils/studyTrack';

/** Somente abertura do nivel; responder e registrar conclusao pertencem a outra task. */
export function LearningLevelModal({
  level,
  onClose,
}: {
  level: StudyLevel | null;
  onClose: () => void;
}) {
  if (!level) return null;
  const question = level.question;
  const content = question.published;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <LearningButton onPress={onClose} accessibilityLabel="Voltar à trilha">
            <Feather name="arrow-left" color={colors.white} size={24} />
          </LearningButton>
          <Text accessibilityRole="header" style={styles.level}>
            Nível {level.number}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.caption}>
            {content.type === 'LEARNING' ? 'Aprendizado' : 'Questão'}
          </Text>
          <Text accessibilityRole="header" style={styles.title}>
            {questionHeading(question)}
          </Text>
          {content.type === 'LEARNING' ? (
            <>
              <Text style={styles.body}>{learningContent(content)}</Text>
              {'keyTakeaways' in content &&
                content.keyTakeaways?.map((item, index) => (
                  <Text key={index} style={styles.takeaway}>
                    • {item}
                  </Text>
                ))}
              {'tips' in content && content.tips && <Text style={styles.body}>{content.tips}</Text>}
            </>
          ) : (
            <Text style={styles.body}>
              Você está no nível certo. A atividade para responder a esta questão estará disponível
              em breve.
            </Text>
          )}
        </ScrollView>
        <LearningButton onPress={onClose} style={styles.back}>
          <Text style={styles.level}>Voltar à trilha</Text>
        </LearningButton>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: learningColors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  level: { color: colors.white, fontWeight: '600', fontSize: 16 },
  content: { padding: 24, gap: 24 },
  caption: { color: colors.placeholderOnDark, fontSize: 14 },
  title: { color: colors.white, fontSize: 24, lineHeight: 34, fontWeight: '700' },
  body: { color: colors.white, fontSize: 16, lineHeight: 26 },
  takeaway: { color: learningColors.connector, fontSize: 16, lineHeight: 26 },
  back: { backgroundColor: learningColors.chip, margin: 24, padding: 16 },
});
