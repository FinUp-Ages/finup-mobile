import type {
  StudyCategoryProgress,
  StudyLevelProgress,
  StudyTrackProgress,
} from '../types/studyTrack';
import { studyStars } from './studyQuestion';

const percentage = (part: number, whole: number) => (whole ? (part * 100) / whole : 0);

/** Estrelas de um nível no C6: 3 no acerto, 1 no erro, sem estrelas sem nota. */
export function levelStars(correct: boolean | null): number | null {
  if (correct === null) return null;
  return correct ? 3 : 1;
}

/**
 * Mesmas regras do GET /study-tracks/progress (C6), para o mock reproduzir o back: concluído é ter
 * resposta; o nível atual é o primeiro não concluído na ordem das perguntas publicadas.
 */
export function buildCategoryProgress(
  categoryId: string,
  questionIds: string[],
  answers: ReadonlyMap<string, { correct: boolean | null }>,
): StudyCategoryProgress {
  const levels: StudyLevelProgress[] = questionIds.map((questionId, index) => {
    const answer = answers.get(questionId);
    const correct = answer ? answer.correct : null;
    return {
      level: index + 1,
      questionId,
      completed: !!answer,
      correct,
      stars: levelStars(correct),
    };
  });
  const answered = levels.filter((level) => level.completed).length;
  const gradable = levels.filter((level) => level.correct !== null).length;
  const correct = levels.filter((level) => level.correct === true).length;
  const firstPending = levels.findIndex((level) => !level.completed);
  return {
    categoryId,
    totalQuestions: levels.length,
    answeredQuestions: answered,
    correctAnswers: correct,
    gradableQuestions: gradable,
    stars: studyStars(correct, gradable),
    percentage: percentage(correct, gradable),
    completionPercentage: percentage(answered, levels.length),
    currentLevel: firstPending === -1 ? levels.length : firstPending + 1,
    levels,
  };
}

export function buildTrackProgress(categories: StudyCategoryProgress[]): StudyTrackProgress {
  const sum = (
    field: 'totalQuestions' | 'answeredQuestions' | 'correctAnswers' | 'gradableQuestions',
  ) => categories.reduce((total, category) => total + category[field], 0);
  const totalQuestions = sum('totalQuestions');
  const answeredQuestions = sum('answeredQuestions');
  const correctAnswers = sum('correctAnswers');
  const gradableQuestions = sum('gradableQuestions');
  return {
    categories,
    total: {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      gradableQuestions,
      stars: studyStars(correctAnswers, gradableQuestions),
      percentage: percentage(correctAnswers, gradableQuestions),
      completionPercentage: percentage(answeredQuestions, totalQuestions),
    },
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isStars = (value: unknown) => value === null || value === undefined || isCount(value);

/**
 * Valida o envelope do progresso. Formato inesperado vira erro: a trilha então abre todos os
 * níveis em vez de travar conteúdo com dados que não entende.
 */
export function parseStudyTrackProgress(value: unknown): StudyTrackProgress {
  const invalid = () => new Error('Progresso da trilha em formato inesperado.');
  if (!isRecord(value) || !Array.isArray(value.categories)) throw invalid();
  const categories = value.categories.map((item: unknown): StudyCategoryProgress => {
    if (
      !isRecord(item) ||
      typeof item.categoryId !== 'string' ||
      !isCount(item.completionPercentage) ||
      !isCount(item.currentLevel) ||
      !isStars(item.stars) ||
      !Array.isArray(item.levels)
    )
      throw invalid();
    const levels = item.levels.map((level: unknown): StudyLevelProgress => {
      if (
        !isRecord(level) ||
        typeof level.questionId !== 'string' ||
        typeof level.completed !== 'boolean' ||
        !isCount(level.level) ||
        !isStars(level.stars)
      )
        throw invalid();
      return {
        level: level.level,
        questionId: level.questionId,
        completed: level.completed,
        correct: typeof level.correct === 'boolean' ? level.correct : null,
        stars: typeof level.stars === 'number' ? level.stars : null,
      };
    });
    return {
      ...(item as StudyCategoryProgress),
      stars: (item.stars as number | null) ?? null,
      levels,
    };
  });
  return { ...(value as StudyTrackProgress), categories };
}
