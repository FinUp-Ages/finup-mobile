import { Feather } from '@expo/vector-icons';
import Markdown, { MarkdownIt } from '@ronradtke/react-native-markdown-display';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LearningButton } from '@/components/learning/LearningButton';
import { Text, TextInput } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { exerciseColors } from '@/theme/studyQuestionColors';
import { interFamilyFor } from '@/theme/fonts';
import { questionHeading, questionTitle } from '@/utils/studyQuestion';
import type { StudySessionViewModel } from '@/viewmodels/useStudySessionViewModel';

const markdown = MarkdownIt({ html: false }).disable(['image', 'link', 'autolink']);

export function StudyQuestionModal({
  vm,
  topic,
  onClose,
}: {
  vm: StudySessionViewModel;
  topic: string;
  onClose: () => void;
}) {
  const { session, question } = vm;
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollViewInstance>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [session.index]);
  const busy = session.phase === 'submitting';
  const feedback = session.phase === 'feedback';
  const content = question?.published;
  const currentAnswer = question ? session.answers[question.id] : undefined;

  function requestClose() {
    if (busy) return;
    const hasDraft =
      Object.keys(session.answers).length > 0 ||
      session.selected !== null ||
      !!session.input.trim();
    if (session.phase === 'complete' || !hasDraft) {
      onClose();
      return;
    }
    Alert.alert('Sair da atividade?', 'Suas respostas desta rodada ainda não foram salvas.', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: onClose },
    ]);
  }

  function respond() {
    Keyboard.dismiss();
    vm.respond();
  }

  const correctLabels =
    content?.type === 'MULTIPLE_CHOICE'
      ? content.options
          .flatMap((option, index) => (option.correct ? [String.fromCharCode(65 + index)] : []))
          .join(', ')
      : content?.type === 'FILL_BLANK'
        ? content.answers[0]
        : '';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={requestClose}>
      <View style={[styles.backdrop, { paddingTop: Math.max(insets.top, 16) + 16 }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheet}
        >
          <View style={styles.grabber} accessible={false} />
          <View style={styles.header}>
            <LearningButton
              accessibilityLabel="Voltar à trilha"
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={requestClose}
              style={[styles.close, busy && styles.disabled]}
            >
              <Feather name="x" color={exerciseColors.text} size={24} />
            </LearningButton>
            <Text accessibilityRole="header" numberOfLines={2} style={styles.headerTitle}>
              {topic} - Lv. {session.index + 1}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {busy ? (
            <View accessibilityLiveRegion="polite" style={styles.center}>
              <ActivityIndicator
                color={exerciseColors.text}
                accessibilityLabel="Salvando suas respostas"
              />
              <Text style={styles.body}>Salvando suas respostas…</Text>
            </View>
          ) : session.phase === 'complete' && session.result ? (
            <View accessibilityLiveRegion="polite" style={styles.center}>
              <Feather name="check-circle" size={48} color={exerciseColors.successText} />
              <Text accessibilityRole="header" style={styles.title}>
                Rodada concluída!
              </Text>
              <Text style={styles.body}>
                {session.result.gradableCount
                  ? `Você acertou ${session.result.correctCount} de ${session.result.gradableCount} questões.`
                  : 'Você concluiu a leitura de todos os conteúdos deste curso.'}
              </Text>
              {session.result.stars !== null && (
                <Text
                  accessibilityLabel={`${session.result.stars} de 3 estrelas na rodada`}
                  style={styles.stars}
                >
                  {'★'.repeat(session.result.stars)}
                  {'☆'.repeat(3 - session.result.stars)}
                </Text>
              )}
              <Text style={styles.body}>Suas respostas foram salvas.</Text>
            </View>
          ) : session.phase === 'save-error' ? (
            <View accessibilityLiveRegion="assertive" style={styles.center}>
              <Feather name="alert-circle" size={40} color={exerciseColors.errorText} />
              <Text accessibilityRole="header" style={styles.title}>
                Não foi possível concluir
              </Text>
              <Text style={styles.body}>{session.error}</Text>
              <Text style={styles.body}>
                Suas respostas continuam aqui para tentar salvar novamente.
              </Text>
            </View>
          ) : !question ? (
            <View style={styles.center}>
              <Text style={styles.body}>{vm.contentError ?? 'Nenhuma questão disponível.'}</Text>
            </View>
          ) : (
            <ScrollView
              ref={scroll}
              style={styles.scroll}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.caption}>
                {content.type === 'LEARNING' ? 'Aprendizado' : `Questão ${session.index + 1}`}
              </Text>
              <View style={styles.statement}>
                <Text accessibilityRole="header" style={styles.title}>
                  {questionTitle(question, topic)}
                </Text>
                {content.type !== 'LEARNING' && (
                  <Text style={styles.body}>{questionHeading(question)}</Text>
                )}
              </View>
              {content.type === 'MULTIPLE_CHOICE' && (
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel="Alternativas"
                  style={styles.options}
                >
                  {content.options.map((option, index) => (
                    <LearningButton
                      key={index}
                      accessibilityRole="radio"
                      accessibilityState={{
                        checked: session.selected === index,
                        disabled: feedback,
                      }}
                      accessibilityLabel={`${String.fromCharCode(65 + index)}. ${option.text}`}
                      disabled={feedback}
                      onPress={() => vm.select(index)}
                      style={[
                        styles.option,
                        session.selected === index && styles.selected,
                        feedback && option.correct && styles.correct,
                        feedback &&
                          session.selected === index &&
                          !currentAnswer?.correct &&
                          styles.incorrect,
                      ]}
                    >
                      <Text style={styles.optionText}>{option.text}</Text>
                    </LearningButton>
                  ))}
                </View>
              )}
              {content.type === 'FILL_BLANK' && (
                <TextInput
                  accessibilityLabel="Sua resposta para a lacuna"
                  placeholder="Digite sua resposta"
                  placeholderTextColor={colors.textSecondary}
                  value={session.input}
                  onChangeText={vm.setInput}
                  editable={!feedback}
                  autoCapitalize="sentences"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (vm.canRespond) respond();
                  }}
                  style={[
                    styles.input,
                    feedback && (currentAnswer?.correct ? styles.correct : styles.incorrect),
                  ]}
                />
              )}
              {content.type === 'LEARNING' && (
                <Markdown markdownit={markdown} style={markdownStyles}>
                  {content.body}
                </Markdown>
              )}
              {feedback && (
                <View accessibilityLiveRegion="polite" style={styles.feedback}>
                  <View style={styles.feedbackHeading}>
                    <Feather
                      name={currentAnswer?.correct ? 'check-circle' : 'x-circle'}
                      size={20}
                      color={
                        currentAnswer?.correct
                          ? exerciseColors.successText
                          : exerciseColors.errorText
                      }
                    />
                    <Text style={styles.feedbackTitle}>
                      {currentAnswer?.correct ? 'Você acertou!' : 'Ainda não foi desta vez.'}
                    </Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Resposta: {correctLabels}</Text>
                  <Text style={styles.body}>
                    {'explanation' in content && content.explanation?.trim()
                      ? content.explanation
                      : 'Confira a resposta correta para continuar aprendendo.'}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
            {!busy && !['complete', 'save-error'].includes(session.phase) && question && (
              <View
                accessibilityRole="progressbar"
                accessibilityLabel="Questões respondidas nesta rodada"
                accessibilityValue={{ min: 0, max: 100, now: vm.progress }}
                style={styles.track}
              >
                <View style={[styles.fill, { width: `${vm.progress}%` }]} />
              </View>
            )}
            {!busy && (
              <LearningButton
                disabled={
                  session.phase === 'answering' &&
                  content?.type !== 'LEARNING' &&
                  !vm.canRespond &&
                  !!question
                }
                accessibilityState={{
                  disabled:
                    session.phase === 'answering' &&
                    content?.type !== 'LEARNING' &&
                    !vm.canRespond &&
                    !!question,
                }}
                onPress={
                  session.phase === 'complete' || !question
                    ? onClose
                    : session.phase === 'save-error'
                      ? vm.retry
                      : feedback || content?.type === 'LEARNING'
                        ? vm.advance
                        : respond
                }
                style={[
                  styles.primary,
                  session.phase === 'answering' &&
                    content?.type !== 'LEARNING' &&
                    !vm.canRespond &&
                    styles.disabled,
                ]}
              >
                <Text style={styles.primaryText}>
                  {session.phase === 'complete' || !question
                    ? 'Voltar à trilha'
                    : session.phase === 'save-error'
                      ? 'Tentar salvar novamente'
                      : feedback || content?.type === 'LEARNING'
                        ? 'Próximo'
                        : 'Responder'}
                </Text>
              </LearningButton>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.navy },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    overflow: 'hidden',
  },
  grabber: {
    width: 58,
    height: 4,
    borderRadius: 2,
    backgroundColor: exerciseColors.grabber,
    alignSelf: 'center',
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: 16,
    gap: 12,
  },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: exerciseColors.option },
  headerSpacer: { width: 44 },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: exerciseColors.text,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 24 },
  caption: { fontSize: 16, color: exerciseColors.text },
  statement: { gap: 8 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '500', color: exerciseColors.text },
  body: { fontSize: 16, lineHeight: 23, color: exerciseColors.text },
  options: { gap: 16 },
  option: {
    alignItems: 'flex-start',
    backgroundColor: exerciseColors.option,
    minHeight: 50,
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionText: { fontSize: 14, lineHeight: 20, color: exerciseColors.text },
  selected: { backgroundColor: exerciseColors.selected },
  correct: { backgroundColor: exerciseColors.correct },
  incorrect: { backgroundColor: exerciseColors.incorrect },
  input: {
    minHeight: 50,
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: exerciseColors.option,
    fontSize: 16,
    color: exerciseColors.text,
  },
  feedback: { gap: 6, paddingHorizontal: 5 },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  feedbackTitle: { flexShrink: 1, fontSize: 16, fontWeight: '700', color: exerciseColors.text },
  footer: { paddingHorizontal: 16, paddingTop: 16, gap: 32 },
  track: {
    height: 4,
    marginHorizontal: 16,
    backgroundColor: colors.track,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: 4, backgroundColor: exerciseColors.text, borderRadius: 2 },
  primary: {
    minHeight: 55,
    borderRadius: 100,
    backgroundColor: exerciseColors.text,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  primaryText: { fontSize: 16, color: colors.white, textAlign: 'center' },
  disabled: { opacity: 0.45 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 20 },
  stars: { fontSize: 38, color: exerciseColors.star },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: exerciseColors.text,
    fontFamily: interFamilyFor('400'),
    fontSize: 16,
    lineHeight: 25,
  },
  heading1: { fontFamily: interFamilyFor('700'), fontSize: 24, lineHeight: 32 },
  heading2: { fontFamily: interFamilyFor('600'), fontSize: 20, lineHeight: 28 },
});
