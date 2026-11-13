import { useEffect, useRef, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { studyAnswersModel } from '@/models/studyAnswersModel';
import type { StudyQuestion } from '@/types/studyTrack';
import type { StudyAnswersResponse } from '@/types/studySession';
import {
  canRespond,
  createStudySession,
  studySessionPayload,
  studySessionReducer,
  type StudySession,
  type StudySessionAction,
} from '@/utils/studySession';
import { completionPercentage, parseStudySessionQuestions } from '@/utils/studyQuestion';

export function useStudySessionViewModel({
  categoryId,
  questions,
  startQuestionId,
  onSaved,
}: {
  categoryId: string;
  questions: StudyQuestion[];
  startQuestionId: string;
  onSaved: (result: StudyAnswersResponse) => void;
}) {
  const [initial] = useState(() => {
    try {
      const parsed = parseStudySessionQuestions(questions);
      if (!parsed.some((question) => question.id === startQuestionId)) {
        throw new Error('Esta questão não está disponível. Volte à trilha e abra novamente.');
      }
      return { questions: parsed, error: null };
    } catch (error) {
      return {
        questions: [],
        error: error instanceof Error ? error.message : 'Não foi possível abrir a atividade.',
      };
    }
  });
  const [session, setSession] = useState(() =>
    createStudySession(initial.questions, startQuestionId),
  );
  // Transições síncronas evitam responder, avançar ou enviar duas vezes em toques rápidos.
  const current = useRef(session);
  const mounted = useRef(true);
  const saving = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function dispatch(action: StudySessionAction) {
    const next = studySessionReducer(current.current, action);
    current.current = next;
    if (mounted.current) setSession(next);
    return next;
  }

  async function save(snapshot: StudySession) {
    if (saving.current || snapshot.phase !== 'submitting') return;
    saving.current = true;
    try {
      const result = await studyAnswersModel.submitAnswers(
        studySessionPayload(snapshot, categoryId),
      );
      if (!mounted.current) return;
      dispatch({ type: 'saved', result });
      onSaved(result);
    } catch (error) {
      if (!mounted.current) return;
      dispatch({
        type: 'failed',
        message:
          error instanceof HttpError && (error.status === 400 || error.status === 404)
            ? 'O conteúdo do curso pode ter mudado. Volte à trilha e abra a atividade novamente.'
            : 'Não foi possível salvar suas respostas. Confira sua conexão e tente novamente.',
      });
    } finally {
      saving.current = false;
    }
  }

  function advance() {
    const before = current.current;
    const next = dispatch({ type: 'next' });
    if (next !== before && next.phase === 'submitting') void save(next);
  }

  return {
    session,
    contentError: initial.error,
    question: session.questions[session.index],
    canRespond: canRespond(session),
    progress: completionPercentage(Object.keys(session.answers).length, session.questions.length),
    select: (index: number) => dispatch({ type: 'select', index }),
    setInput: (value: string) => dispatch({ type: 'input', value }),
    respond: () => dispatch({ type: 'respond' }),
    advance,
    retry: () => {
      const next = dispatch({ type: 'retry' });
      void save(next);
    },
  };
}

export type StudySessionViewModel = ReturnType<typeof useStudySessionViewModel>;
