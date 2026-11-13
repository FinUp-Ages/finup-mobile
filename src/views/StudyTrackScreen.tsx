import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LearningButton } from '@/components/learning/LearningButton';
import { LearningPath } from '@/components/learning/LearningPath';
import { LearningProgress } from '@/components/learning/LearningProgress';
import { useTabBarClearance } from '@/components/navigation/TabBarClearance';
import { Text } from '@/components/ui/AppText';
import { colors, darkColors, learningColors } from '@/theme/colors';
import { useStudyTrackViewModel } from '@/viewmodels/useStudyTrackViewModel';
import StudySessionScreen from '@/views/StudySessionScreen';

export default function StudyTrackScreen() {
  const router = useRouter();
  const vm = useStudyTrackViewModel();
  const tabBarClearance = useTabBarClearance();
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 32 + tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Abrir perfil"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.navigate('/profile')}
            style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
          >
            <Feather name="user" size={20} color={darkColors.textMuted} />
          </Pressable>
          <View>
            <Text style={styles.eyebrow}>Sua conta</Text>
            <Text accessibilityRole="header" style={styles.headerTitle}>
              Trilha de aprendizado
            </Text>
          </View>
        </View>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Cursos
        </Text>
        {vm.status === 'loading' && <Feedback loading title="Carregando cursos…" />}
        {vm.status === 'error' && (
          <Feedback title="Não foi possível carregar os cursos." onRetry={vm.retry} />
        )}
        {vm.status === 'success' && vm.categories.length === 0 && (
          <Feedback title="Nenhum curso disponível ainda." />
        )}
        {vm.status === 'success' && vm.categories.length > 0 && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {vm.categories.map((category, index) => {
                const selected = category.id === vm.categoryId;
                return (
                  <LearningButton
                    key={category.id}
                    accessibilityLabel={category.name}
                    accessibilityState={{ selected }}
                    onPress={() => vm.selectCategory(category.id)}
                    style={[styles.chip, selected && styles.selectedChip]}
                  >
                    {!selected && (
                      <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Svg width="100%" height="100%">
                          <Defs>
                            <RadialGradient
                              id={`chip-${index}`}
                              cx="50%"
                              cy="100%"
                              rx="50%"
                              ry="100%"
                            >
                              <Stop offset="0" stopColor={learningColors.chip} />
                              <Stop offset="0.5" stopColor={learningColors.chipMiddle} />
                              <Stop offset="0.75" stopColor={learningColors.chipLow} />
                              <Stop offset="1" stopColor={learningColors.background} />
                            </RadialGradient>
                          </Defs>
                          <Rect width="100%" height="100%" fill={`url(#chip-${index})`} />
                        </Svg>
                      </View>
                    )}
                    <Text style={styles.chipText}>{category.name}</Text>
                  </LearningButton>
                );
              })}
            </ScrollView>
            <View style={styles.summary}>
              <LearningButton
                accessibilityLabel={`Tópico: ${vm.topic}`}
                accessibilityHint="Mostra o tópico deste curso"
                accessibilityState={{ expanded: vm.topicOpen }}
                onPress={() => vm.setTopicOpen(true)}
                style={styles.topic}
              >
                <Feather name="chevron-down" size={16} color={colors.white} />
                <Text numberOfLines={2} style={styles.topicText}>
                  {vm.topic}
                </Text>
              </LearningButton>
              <LearningProgress value={vm.questionStatus === 'success' ? vm.progress : null} />
            </View>
            {vm.questionStatus === 'loading' && <Feedback loading title="Carregando sua trilha…" />}
            {vm.questionStatus === 'error' && (
              <Feedback title="Não foi possível carregar os níveis." onRetry={vm.retryQuestions} />
            )}
            {vm.questionStatus === 'success' &&
              (vm.levels.length ? (
                <>
                  <LearningPath levels={vm.levels} onOpen={vm.openLevel} />
                  <Text style={styles.notice}>
                    {vm.isDemo
                      ? 'Progresso e estrelas de demonstração.'
                      : 'Seu progresso e suas estrelas estarão disponíveis em breve.'}
                  </Text>
                </>
              ) : (
                <Feedback title="Este curso ainda não tem níveis publicados." />
              ))}
          </>
        )}
      </ScrollView>
      <Modal
        visible={vm.topicOpen}
        transparent
        animationType="fade"
        onRequestClose={() => vm.setTopicOpen(false)}
      >
        <View style={styles.overlay}>
          <View accessibilityViewIsModal style={styles.topicDialog}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Tópico do curso
            </Text>
            <LearningButton
              accessibilityState={{ selected: true }}
              onPress={() => vm.setTopicOpen(false)}
              style={styles.topicOption}
            >
              <Text style={styles.topicText}>{vm.topic}</Text>
              <Feather name="check" color={colors.white} size={20} />
            </LearningButton>
            {!!vm.selectedCategory?.description && (
              <Text style={styles.description}>{vm.selectedCategory.description}</Text>
            )}
            <LearningButton
              accessibilityLabel="Fechar seletor de tópico"
              onPress={() => vm.setTopicOpen(false)}
            >
              <Text style={styles.chipText}>Fechar</Text>
            </LearningButton>
          </View>
        </View>
      </Modal>
      {vm.openedLevel && vm.categoryId && (
        <StudySessionScreen
          key={`${vm.categoryId}:${vm.openedLevel.question.id}`}
          categoryId={vm.categoryId}
          topic={vm.topic}
          questions={vm.questions}
          startQuestionId={vm.openedLevel.question.id}
          onSaved={vm.retryQuestions}
          onClose={() => {
            vm.closeLevel();
            vm.retryQuestions();
          }}
        />
      )}
    </SafeAreaView>
  );
}

function Feedback({
  title,
  loading,
  onRetry,
}: {
  title: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.feedback}>
      {loading && <ActivityIndicator color={learningColors.connector} accessibilityLabel={title} />}
      <Text style={styles.description}>{title}</Text>
      {onRetry && (
        <LearningButton onPress={onRetry} style={styles.retry}>
          <Text style={styles.chipText}>Tentar novamente</Text>
        </LearningButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: learningColors.background },
  content: { paddingTop: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPressed: { opacity: 0.8 },
  eyebrow: {
    fontSize: 12,
    color: darkColors.textMuted,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: darkColors.textPrimary },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    letterSpacing: 0.32,
  },
  chips: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: {
    overflow: 'hidden',
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: learningColors.chip,
    borderRadius: 10,
  },
  selectedChip: { backgroundColor: learningColors.chip },
  chipText: { fontSize: 14, color: colors.white, letterSpacing: 0.28 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
  },
  topic: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: colors.glassSoft,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '72%',
  },
  topicText: { fontSize: 16, color: colors.white, flexShrink: 1 },
  notice: {
    fontSize: 12,
    color: colors.placeholderOnDark,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  feedback: { padding: 32, gap: 16, alignItems: 'center' },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.placeholderOnDark,
    textAlign: 'center',
  },
  retry: { paddingHorizontal: 20, backgroundColor: learningColors.chip },
  overlay: { flex: 1, backgroundColor: colors.chatOverlay, padding: 24, justifyContent: 'center' },
  topicDialog: {
    backgroundColor: learningColors.background,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  topicOption: {
    backgroundColor: learningColors.chip,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
});
