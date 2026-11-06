import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { HttpError } from '@/config/httpClient';
import { triageModel } from '@/models/triageModel';
import type { Answer, Answers, AssessmentResponse, Questionnaire } from '@/types/triage';
import { answerError, compatibleAnswers, submissionAnswers, visibleQuestions } from '@/utils/triage';

// Request-only function: it never reads or updates React state.
async function fetchTriageData() {
  const [questions, saved, result] = await Promise.all([
    triageModel.getQuestions(), triageModel.getAnswers(), triageModel.getAssessment(),
  ]);
  if (!questions.questions.length) throw new Error('Questionnaire unavailable');
  return { questions, saved, result };
}

export function useTriageViewModel() {
  const router = useRouter();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'form' | 'assessment'>('loading');
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const alive = useRef(true);
  const dirty = useRef(false);
  const applyLoadedData = useCallback(({ questions, saved, result }: Awaited<ReturnType<typeof fetchTriageData>>) => {
    if (!alive.current) return;
    setQuestionnaire(questions);
    setAnswers(compatibleAnswers(questions.questions, saved?.answers ?? {}));
    setAssessment(result);
    setIndex(0);
    setErrors({});
    setStatus(result ? 'assessment' : 'form');
    if (saved && saved.version !== questions.version) setNotice('O questionário foi atualizado. Revise suas respostas.');
  }, []);
  useEffect(() => {
    let active = true;
    alive.current = true;
    void fetchTriageData().then((data) => {
      if (active) applyLoadedData(data);
    }).catch(() => {
      if (active) setStatus('error');
    });
    return () => {
      active = false;
      alive.current = false;
    };
  }, [applyLoadedData]);

  const questions = visibleQuestions(questionnaire?.questions ?? [], answers);
  const current = questions[index];
  const close = () => {
    if (busy.current) return;
    if (status === 'form' && dirty.current) {
      Alert.alert('Sair da triagem?', 'As alterações ainda não foram salvas.', [
        { text: 'Continuar respondendo', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => router.back() },
      ]);
    } else router.back();
  };
  const setAnswer = (value: Answer) => {
    if (!current || busy.current) return;
    dirty.current = true;
    setAnswers((previous) => submissionAnswers(questionnaire!.questions, { ...previous, [current.id]: value }));
    setErrors((previous) => { const next = { ...previous }; delete next[current.id]; return next; });
    setNotice(null);
  };
  const next = async () => {
    if (!current || !questionnaire || busy.current) return;
    const invalid = answerError(current, answers[current.id]);
    if (invalid) { setErrors((previous) => ({ ...previous, [current.id]: invalid })); return; }
    if (index < questions.length - 1) { setIndex(index + 1); return; }
    const firstInvalid = questions.findIndex((question) => answerError(question, answers[question.id]));
    if (firstInvalid >= 0) {
      const question = questions[firstInvalid];
      setErrors({ [question.id]: answerError(question, answers[question.id])! });
      setIndex(firstInvalid);
      return;
    }
    busy.current = true;
    setSubmitting(true);
    setNotice(null);
    try {
      const result = await triageModel.submit(questionnaire.version, submissionAnswers(questionnaire.questions, answers));
      if (!alive.current) return;
      dirty.current = false;
      setAssessment(result);
      setStatus('assessment');
    } catch (error) {
      if (!alive.current) return;
      if (error instanceof HttpError && error.fields.some((item) => item.field === 'version')) {
        try {
          const updated = await triageModel.getQuestions();
          if (!alive.current) return;
          setQuestionnaire(updated);
          setAnswers(compatibleAnswers(updated.questions, answers));
          setIndex(0);
          setErrors({});
          setNotice('O questionário foi atualizado. Revise as respostas antes de enviar novamente.');
        } catch {
          if (alive.current) setNotice('Não foi possível atualizar o questionário. Tente enviar novamente.');
        }
      } else if (error instanceof HttpError && error.fields.length) {
        const fields = Object.fromEntries(error.fields.map((item) => [item.field.replace(/^answers\./, ''), item.message]));
        setErrors(fields);
        const position = questions.findIndex((question) => fields[question.id]);
        if (position >= 0) setIndex(position);
        setNotice('Revise as respostas indicadas e tente novamente.');
      } else {
        setNotice(error instanceof HttpError && error.detail ? error.detail : 'Não foi possível salvar suas respostas. Tente novamente.');
      }
    } finally {
      busy.current = false;
      if (alive.current) setSubmitting(false);
    }
  };
  return {
    status, current, answers, assessment, index, total: questions.length, errors, notice, submitting,
    load: () => {
      setStatus('loading');
      setNotice(null);
      void fetchTriageData().then(applyLoadedData).catch(() => {
        if (alive.current) setStatus('error');
      });
    },
    close, setAnswer, next,
    back: () => { if (!busy.current) setIndex((previous) => Math.max(0, previous - 1)); },
    retake: () => { setIndex(0); setNotice(null); setErrors({}); setStatus('form'); },
  };
}
