import { useEffect, useRef, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { studyAnswersModel } from '@/models/studyAnswersModel';
import type { StudyQuestion } from '@/types/studyTrack';
import type { StudyAnswersResponse } from '@/types/studySession';
import {
  canRespond,
  createStudySession,
  roundSize,
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
  // Respostas já dadas que o back ainda não confirmou (falha de rede no envio individual).
  const [unsaved, setUnsaved] = useState<ReadonlySet<string>>(new Set());
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

  function markUnsaved(questionId: string, pending: boolean) {
    if (!mounted.current) return;
    setUnsaved((previous) => {
      const next = new Set(previous);
      if (pending) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
  }

  /**
   * Salva a resposta assim que ela é dada, para o avanço na trilha não depender de terminar a
   * rodada. Falha aqui não interrompe a atividade: o envio do fim da rodada repete o conjunto.
   */
  function saveAnswer(snapshot: StudySession, questionId: string) {
    if (!Object.hasOwn(snapshot.answers, questionId)) return;
    markUnsaved(questionId, true);
    studyAnswersModel.submitAnswers(studySessionPayload(snapshot, categoryId, questionId)).then(
      () => markUnsaved(questionId, false),
      () => undefined,
    );
  }

  async function save(snapshot: StudySession) {
    if (saving.current || snapshot.phase !== 'submitting') return;
    saving.current = true;
    try {
      const result = await studyAnswersModel.submitAnswers(
        studySessionPayload(snapshot, categoryId),
      );
      if (!mounted.current) return;
      setUnsaved(new Set());
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

  function respond() {
    const before = current.current;
    const next = dispatch({ type: 'respond' });
    if (next !== before && next.phase === 'feedback') {
      saveAnswer(next, next.questions[next.index].id);
    }
  }

  function advance() {
    const before = current.current;
    const question = before.questions[before.index];
    const next = dispatch({ type: 'next' });
    if (next === before) return;
    // Leitura não tem "Responder": conta como concluída ao avançar.
    if (question?.published.type === 'LEARNING' && next.phase !== 'submitting') {
      saveAnswer(next, question.id);
    }
    if (next.phase === 'submitting') void save(next);
  }

  const answeredInRound = session.questions
    .slice(session.start)
    .filter((question) => Object.hasOwn(session.answers, question.id)).length;

  return {
    session,
    contentError: initial.error,
    question: session.questions[session.index],
    canRespond: canRespond(session),
    progress: completionPercentage(answeredInRound, roundSize(session)),
    /** Respostas já dadas que ainda não chegaram ao servidor. */
    unsavedCount: unsaved.size,
    select: (index: number) => dispatch({ type: 'select', index }),
    setInput: (value: string) => dispatch({ type: 'input', value }),
    respond,
    advance,
    retry: () => {
      const next = dispatch({ type: 'retry' });
      void save(next);
    },
  };
}

export type StudySessionViewModel = ReturnType<typeof useStudySessionViewModel>;
