import type { StudyLevel, StudyQuestion } from '../types/studyTrack';

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

export function nextUnreachedLevelIndex(levels: StudyLevel[]): number {
  return levels.findIndex((level) => !level.reached);
}

export function questionHeading(question: StudyQuestion): string {
  switch (question.type) {
    case 'LEARNING':
      return question.published.title;
    case 'MULTIPLE_CHOICE':
      return question.published.statement;
    case 'FILL_BLANK':
      return 'statement' in question.published
        ? question.published.statement
        : question.published.textWithBlanks.replace(/\{[^}]*\}/g, '_____');
  }
}

export function learningContent(question: Extract<StudyQuestion, { type: 'LEARNING' }>): string {
  return 'body' in question.published ? question.published.body : question.published.content;
}
