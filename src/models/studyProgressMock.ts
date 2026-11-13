import type { StudyAnswersRequest, StudyAnswersResponse } from '../types/studySession';
import type { StudyTrackProgress } from '../types/studyTrack';
import { buildCategoryProgress, buildTrackProgress } from '../utils/studyProgress';
import { gradeStudyAnswers, parseStudySessionQuestions, studyStars } from '../utils/studyQuestion';
import { getStudyQuestionsMock, studyCategoriesMock } from './studyTrackMock';

type StoredAnswer = { answer: string | null; correct: boolean | null; submittedAt: string };

/**
 * Respostas do modo demonstração (`EXPO_PUBLIC_USE_MOCKS=true`), em memória até recarregar o app.
 * Simula o back do C6: POST parcial que substitui a resposta anterior e GET /progress calculado
 * com as mesmas regras (`buildCategoryProgress`).
 */
const store = new Map<string, Map<string, StoredAnswer>>();

/**
 * Estado inicial da demonstração em Renda Fixa: leitura do nível 1 e acerto do nível 2, então o
 * nível 3 é o atual e os níveis 4 e 5 ficam com nuvem.
 */
export function resetStudyProgressMock(): void {
  store.clear();
  const [first, second] = getStudyQuestionsMock(studyCategoriesMock[0].id);
  const submittedAt = new Date(0).toISOString();
  store.set(
    studyCategoriesMock[0].id,
    new Map([
      [first.id, { answer: null, correct: null, submittedAt }],
      [second.id, { answer: 'O valor investido e os juros já ganhos', correct: true, submittedAt }],
    ]),
  );
}
resetStudyProgressMock();

export function submitStudyAnswersMock(payload: StudyAnswersRequest): StudyAnswersResponse {
  const questions = parseStudySessionQuestions(getStudyQuestionsMock(payload.categoryId));
  const graded = gradeStudyAnswers(questions, payload);
  const saved = store.get(payload.categoryId) ?? new Map<string, StoredAnswer>();
  for (const item of graded.answers) {
    saved.set(item.questionId, {
      answer: item.answer,
      correct: item.correct,
      submittedAt: item.submittedAt,
    });
  }
  store.set(payload.categoryId, saved);
  const answers = questions
    .filter((question) => saved.has(question.id))
    .map((question) => ({ questionId: question.id, ...saved.get(question.id)! }));
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

export function getStudyProgressMock(): StudyTrackProgress {
  return buildTrackProgress(
    [...studyCategoriesMock]
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .map((category) =>
        buildCategoryProgress(
          category.id,
          getStudyQuestionsMock(category.id).map((question) => question.id),
          store.get(category.id) ?? new Map(),
        ),
      ),
  );
}
