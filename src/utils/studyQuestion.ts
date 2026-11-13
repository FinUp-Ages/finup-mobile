import type {
  StudyAnswersRequest,
  StudyAnswersResponse,
  StudySessionQuestion,
} from '../types/studySession';

const normalize = (value: string | null) => (value ?? '').trim().toLowerCase();
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim();

/** Rejeita o conjunto inteiro: descartar itens mudaria a numeração dos níveis da trilha. */
export function parseStudySessionQuestions(value: unknown): StudySessionQuestion[] {
  const invalid = () =>
    new Error('Não foi possível ler as questões deste curso. Tente novamente mais tarde.');
  if (!Array.isArray(value)) throw invalid();
  const ids = new Set<string>();
  for (const item of value) {
    if (!record(item) || !text(item.id) || ids.has(item.id) || !record(item.published))
      throw invalid();
    ids.add(item.id);
    const p = item.published;
    if (p.explanation !== undefined && typeof p.explanation !== 'string') throw invalid();
    if (p.title !== undefined && !text(p.title)) throw invalid();
    switch (p.type) {
      case 'MULTIPLE_CHOICE':
        if (
          !text(p.statement) ||
          !Array.isArray(p.options) ||
          !p.options.length ||
          !p.options.every(
            (option: unknown) =>
              record(option) && text(option.text) && typeof option.correct === 'boolean',
          ) ||
          !p.options.some((option: { correct: boolean }) => option.correct)
        )
          throw invalid();
        break;
      case 'FILL_BLANK':
        if (
          !text(p.title) ||
          !text(p.statement) ||
          !Array.isArray(p.answers) ||
          !p.answers.length ||
          !p.answers.every(text)
        )
          throw invalid();
        break;
      case 'LEARNING':
        if (!text(p.title) || !text(p.body)) throw invalid();
        break;
      default:
        throw invalid();
    }
  }
  return value as StudySessionQuestion[];
}

export function questionHeading(question: StudySessionQuestion): string {
  const content = question.published;
  return content.type === 'LEARNING' ? content.title : content.statement;
}

export function questionTitle(question: StudySessionQuestion, categoryName: string): string {
  return question.published.title || categoryName;
}

/** Mesmas regras do servidor: texto, caixa e espaços externos; sem remover acentos. */
export function gradeStudySessionQuestion(
  question: StudySessionQuestion,
  answer: string | null,
): boolean | null {
  const content = question.published;
  if (content.type === 'LEARNING') return null;
  if (content.type === 'FILL_BLANK')
    return content.answers.some((item) => normalize(item) === normalize(answer));
  return content.options.some(
    (option) => option.correct && normalize(option.text) === normalize(answer),
  );
}

export function studyStars(correct: number, gradable: number): number | null {
  if (!gradable) return null;
  const percentage = (correct * 100) / gradable;
  return percentage < 50 ? 1 : percentage < 80 ? 2 : 3;
}

/**
 * Usado pelo mock do POST, com a validação do back (C6): uma ou mais perguntas publicadas da
 * categoria, sem repetição. Corrige só o lote enviado; o feedback local nunca é enviado como nota.
 */
export function gradeStudyAnswers(
  questions: StudySessionQuestion[],
  payload: StudyAnswersRequest,
): StudyAnswersResponse {
  const supplied = new Map(payload.answers.map((answer) => [answer.questionId, answer.answer]));
  if (!supplied.size || supplied.size !== payload.answers.length) {
    throw new Error('O lote deve ter perguntas, sem repetição.');
  }
  const known = new Set(questions.map((question) => question.id));
  if ([...supplied.keys()].some((id) => !known.has(id))) {
    throw new Error('O lote só pode conter perguntas publicadas da categoria.');
  }
  const answers = questions
    .filter((question) => supplied.has(question.id))
    .map((question) => ({
      questionId: question.id,
      answer: supplied.get(question.id) ?? null,
      correct: gradeStudySessionQuestion(question, supplied.get(question.id) ?? null),
      submittedAt: new Date().toISOString(),
    }));
  const correctCount = answers.filter((item) => item.correct === true).length;
  const gradableCount = answers.filter((item) => item.correct !== null).length;
  return {
    categoryId: payload.categoryId,
    correctCount,
    gradableCount,
    stars: studyStars(correctCount, gradableCount),
    answers,
  };
}

export function completionPercentage(answered: number, total: number): number {
  return total > 0 ? Math.round(Math.max(0, Math.min(100, (answered * 100) / total))) : 0;
}
