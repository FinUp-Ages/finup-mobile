import type { StudyLearningContent, StudyLevel, StudyQuestion } from '../types/studyTrack';

/** C6 nao oferece progresso; nunca inferir conclusao apenas por existir uma pergunta. */
export function buildStudyLevels(
  questions: StudyQuestion[],
  demo: boolean,
  currentLevel = 4,
): StudyLevel[] {
  const current = Math.max(1, Math.min(Math.trunc(currentLevel), questions.length));
  return questions.map((question, index) => ({
    question,
    number: index + 1,
    stars: demo && index < current - 1 ? 3 : 0,
    reached: demo ? index < current : true,
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
