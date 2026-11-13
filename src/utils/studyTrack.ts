import type {
  StudyCategoryProgress,
  StudyLearningContent,
  StudyLevel,
  StudyQuestion,
} from '../types/studyTrack';

/**
 * Níveis da trilha a partir do progresso do C6 (GET /study-tracks/progress), cruzado por
 * `questionId`. Alcançados: até o primeiro nível não concluído, na ordem das perguntas.
 * Pergunta sem item no progresso (publicada entre as duas chamadas) conta como não concluída.
 * Sem progresso (erro ou carregando), todos os níveis ficam abertos e sem estrelas: nunca travar
 * conteúdo sem saber o que o usuário já fez.
 */
export function buildStudyLevels(
  questions: StudyQuestion[],
  progress: StudyCategoryProgress | null,
): StudyLevel[] {
  if (!progress) {
    return questions.map((question, index) => ({
      question,
      number: index + 1,
      stars: 0,
      reached: true,
    }));
  }
  const byQuestion = new Map(progress.levels.map((level) => [level.questionId, level]));
  const pending = questions.findIndex((question) => !byQuestion.get(question.id)?.completed);
  const current = pending === -1 ? questions.length - 1 : pending;
  return questions.map((question, index) => ({
    question,
    number: index + 1,
    stars: byQuestion.get(question.id)?.stars ?? 0,
    reached: index <= current,
  }));
}

export function questionHeading(question: StudyQuestion): string {
  const content = question.published;
  switch (content.type) {
    case 'LEARNING':
      return content.title;
    case 'MULTIPLE_CHOICE':
      return content.statement;
    case 'FILL_BLANK':
      return 'statement' in content
        ? content.statement
        : content.textWithBlanks.replace(/\{[^}]*\}/g, '_____');
    default:
      // Tipo fora do C6: a tela mostra o nivel sem titulo em vez de quebrar.
      return '';
  }
}

export function learningContent(content: StudyLearningContent): string {
  return 'body' in content ? content.body : content.content;
}
