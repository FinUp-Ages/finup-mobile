import type {
  StudyAnswersRequest,
  StudyAnswersResponse,
  StudySessionQuestion,
} from '../types/studySession';
import { gradeStudySessionQuestion } from './studyQuestion';

export type StudySession = {
  questions: StudySessionQuestion[];
  /** Índice do nível aberto: a rodada vai dele até o último nível, sem voltar ao início. */
  start: number;
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
  const start = Math.max(
    0,
    questions.findIndex((question) => question.id === startQuestionId),
  );
  return {
    questions,
    start,
    index: start,
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

/**
 * Uma rodada vai do nível aberto até o último da categoria. Cada resposta é salva assim que é
 * dada (ver o ViewModel); o envio do fim da rodada repete o conjunto, o que é seguro porque o
 * back substitui a resposta da mesma pergunta.
 */
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
      for (let index = session.index + 1; index < session.questions.length; index++) {
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

/** Respostas dadas na rodada, na ordem dos níveis. O C6 aceita qualquer subconjunto. */
export function studySessionPayload(
  session: StudySession,
  categoryId: string,
  only?: string,
): StudyAnswersRequest {
  const answered = session.questions.filter(
    (question) =>
      Object.hasOwn(session.answers, question.id) && (only === undefined || question.id === only),
  );
  if (!answered.length) {
    throw new Error('Responda ao menos uma questão antes de enviar.');
  }
  return {
    categoryId,
    answers: answered.map((question) => ({
      questionId: question.id,
      answer: session.answers[question.id].answer,
    })),
  };
}

/** Itens da rodada atual (do nível aberto até o fim), para a barra de andamento. */
export function roundSize(session: StudySession): number {
  return Math.max(0, session.questions.length - session.start);
}
