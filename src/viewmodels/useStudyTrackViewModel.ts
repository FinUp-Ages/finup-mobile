import { useCallback, useEffect, useRef, useState } from 'react';
import { studyTrackModel, studyTrackUsesMocks } from '@/models/studyTrackModel';
import type {
  StudyCategory,
  StudyLevel,
  StudyQuestion,
  StudyTrackProgress,
} from '@/types/studyTrack';
import { buildStudyLevels } from '@/utils/studyTrack';

type Status = 'loading' | 'success' | 'error';

export function useStudyTrackViewModel() {
  const [categories, setCategories] = useState<StudyCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [questionStatus, setQuestionStatus] = useState<Status>('loading');
  const [progress, setProgress] = useState<StudyTrackProgress | null>(null);
  const [progressStatus, setProgressStatus] = useState<Status>('loading');
  const [openedLevel, setOpenedLevel] = useState<StudyLevel | null>(null);
  const [topicOpen, setTopicOpen] = useState(false);
  const requests = useRef({ categories: 0, questions: 0, progress: 0 });

  const loadCategories = useCallback(() => {
    const id = ++requests.current.categories;
    return studyTrackModel.categories().then(
      (data) => {
        if (id !== requests.current.categories) return;
        setCategories(data);
        setCategoryId((current) =>
          data.some((item) => item.id === current) ? current : (data[0]?.id ?? null),
        );
        setStatus('success');
      },
      () => {
        if (id === requests.current.categories) setStatus('error');
      },
    );
  }, []);

  const loadQuestions = useCallback((selected: string) => {
    const id = ++requests.current.questions;
    return studyTrackModel.questions(selected).then(
      (data) => {
        if (id !== requests.current.questions) return;
        setQuestions(data);
        setQuestionStatus('success');
      },
      () => {
        if (id === requests.current.questions) setQuestionStatus('error');
      },
    );
  }, []);

  // Falha no progresso não bloqueia a trilha: sem progresso, todos os níveis ficam abertos.
  // Ao recarregar, o progresso anterior continua na tela até chegar o novo.
  const loadProgress = useCallback(() => {
    const id = ++requests.current.progress;
    return studyTrackModel.progress().then(
      (data) => {
        if (id !== requests.current.progress) return;
        setProgress(data);
        setProgressStatus('success');
      },
      () => {
        if (id !== requests.current.progress) return;
        setProgress(null);
        setProgressStatus('error');
      },
    );
  }, []);

  useEffect(() => {
    const pending = requests.current;
    void loadCategories();
    void loadProgress();
    return () => {
      pending.categories++;
      pending.questions++;
      pending.progress++;
    };
  }, [loadCategories, loadProgress]);

  useEffect(() => {
    const pending = requests.current;
    if (categoryId) void loadQuestions(categoryId);
    return () => {
      pending.questions++;
    };
  }, [categoryId, loadQuestions]);

  const selectedCategory = categories.find((item) => item.id === categoryId);
  const categoryProgress =
    progress?.categories.find((item) => item.categoryId === categoryId) ?? null;
  const levels = buildStudyLevels(questions, categoryProgress);
  const refresh = () => {
    if (categoryId) {
      setQuestionStatus((current) => (current === 'error' ? 'loading' : current));
      void loadQuestions(categoryId);
    }
    void loadProgress();
  };
  return {
    categories,
    categoryId,
    selectedCategory,
    levels,
    questions,
    status,
    // Só no primeiro carregamento o progresso segura a trilha: evita mostrar níveis abertos e
    // travá-los logo depois.
    questionStatus:
      questionStatus === 'success' && progressStatus === 'loading' && !progress
        ? ('loading' as const)
        : questionStatus,
    progressUnavailable: progressStatus === 'error',
    openedLevel,
    topicOpen,
    setTopicOpen,
    isDemo: studyTrackUsesMocks,
    progress:
      categoryProgress && levels.length ? Math.round(categoryProgress.completionPercentage) : null,
    topic:
      studyTrackUsesMocks && categoryId === categories[0]?.id
        ? 'CDB'
        : (selectedCategory?.name ?? ''),
    selectCategory: (id: string) => {
      if (id === categoryId) return;
      requests.current.questions++;
      setQuestionStatus('loading');
      setQuestions([]);
      setOpenedLevel(null);
      setTopicOpen(false);
      setCategoryId(id);
    },
    retry: () => {
      setStatus('loading');
      void loadCategories();
      void loadProgress();
    },
    retryQuestions: () => {
      if (categoryId) {
        setQuestionStatus('loading');
        void loadQuestions(categoryId);
      }
      void loadProgress();
    },
    /** Depois de responder ou fechar a atividade: atualiza níveis e progresso sem piscar. */
    refresh,
    openLevel: setOpenedLevel,
    closeLevel: () => setOpenedLevel(null),
  };
}
