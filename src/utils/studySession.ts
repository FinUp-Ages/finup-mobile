import type {
  StudyAnswersRequest,
  StudyAnswersResponse,
  StudySessionQuestion,
} from '../types/studySession';
import { gradeStudySessionQuestion } from './studyQuestion';

export type StudySession = {
  questions: StudySessionQuestion[];
  index: number;
  selected: number | null;
  input: string;
  answers: Record<string, { answer: string | null; correct: boolean | null }>;
  phase: 'answering' | 'feedback' | 'submitting' | 'save-error' | 'complete';
  result: StudyAnswersResponse | null;
  error: string | null;
};

export type StudySessionAction =
  | { type: 'select'; index: number }
  | { type: 'input'; value: string }
  | { type: 'respond' }
  | { type: 'next' }
  | { type: 'retry' }
  | { type: 'saved'; result: StudyAnswersResponse }
  | { type: 'failed'; message: string };

export function createStudySession(
  questions: StudySessionQuestion[],
  startQuestionId: string,
): StudySession {
  return {
    questions,
    index: Math.max(
      0,
      questions.findIndex((question) => question.id === startQuestionId),
    ),
    selected: null,
    input: '',
    answers: {},
    phase: 'answering',
    result: null,
    error: null,
  };
}

export function canRespond(session: StudySession): boolean {
  if (session.phase !== 'answering') return false;
  const content = session.questions[session.index]?.published;
  if (content?.type === 'MULTIPLE_CHOICE')
    return session.selected !== null && !!content.options[session.selected];
  return content?.type === 'FILL_BLANK' && !!session.input.trim();
}

/** Uma rodada percorre todos os itens da categoria, inclusive os anteriores ao nível aberto. */
export function studySessionReducer(
  session: StudySession,
  action: StudySessionAction,
): StudySession {
  const question = session.questions[session.index];
  if (!question) return session;
  switch (action.type) {
    case 'select':
      return session.phase === 'answering' &&
        question.published.type === 'MULTIPLE_CHOICE' &&
        question.published.options[action.index]
        ? { ...session, selected: action.index }
        : session;
    case 'input':
      return session.phase === 'answering' && question.published.type === 'FILL_BLANK'
        ? { ...session, input: action.value }
        : session;
    case 'respond': {
      if (!canRespond(session)) return session;
      const answer =
        question.published.type === 'MULTIPLE_CHOICE'
          ? question.published.options[session.selected!].text
          : session.input.trim();
      return {
        ...session,
        phase: 'feedback',
        answers: {
          ...session.answers,
          [question.id]: { answer, correct: gradeStudySessionQuestion(question, answer) },
        },
      };
    }
    case 'next': {
      if (
        session.phase !== 'feedback' &&
        !(session.phase === 'answering' && question.published.type === 'LEARNING')
      )
        return session;
      const answers =
        question.published.type === 'LEARNING'
          ? { ...session.answers, [question.id]: { answer: null, correct: null } }
          : session.answers;
      for (let offset = 1; offset <= session.questions.length; offset++) {
        const index = (session.index + offset) % session.questions.length;
        if (!Object.hasOwn(answers, session.questions[index].id)) {
          return { ...session, answers, index, selected: null, input: '', phase: 'answering' };
        }
      }
      return { ...session, answers, phase: 'submitting', error: null };
    }
    case 'retry':
      return session.phase === 'save-error'
        ? { ...session, phase: 'submitting', error: null }
        : session;
    case 'saved':
      return session.phase === 'submitting'
        ? { ...session, phase: 'complete', result: action.result, error: null }
        : session;
    case 'failed':
      return session.phase === 'submitting'
        ? { ...session, phase: 'save-error', error: action.message }
        : session;
  }
}

export function studySessionPayload(
  session: StudySession,
  categoryId: string,
): StudyAnswersRequest {
  if (
    !session.questions.length ||
    session.questions.some((question) => !Object.hasOwn(session.answers, question.id))
  ) {
    throw new Error('Conclua todas as questões antes de enviar suas respostas.');
  }
  return {
    categoryId,
    answers: session.questions.map((question) => ({
      questionId: question.id,
      answer: session.answers[question.id].answer,
    })),
  };
}
