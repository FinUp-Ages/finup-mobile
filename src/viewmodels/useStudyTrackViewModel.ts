import { useCallback, useEffect, useRef, useState } from 'react';
import { studyTrackModel, studyTrackUsesMocks } from '@/models/studyTrackModel';
import type { StudyCategory, StudyLevel, StudyQuestion } from '@/types/studyTrack';
import { buildStudyLevels } from '@/utils/studyTrack';

type Status = 'loading' | 'success' | 'error';

const DEMO_CURRENT_LEVEL = 2;

export function useStudyTrackViewModel() {
  const [categories, setCategories] = useState<StudyCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [questionStatus, setQuestionStatus] = useState<Status>('loading');
  const [openedLevel, setOpenedLevel] = useState<StudyLevel | null>(null);
  const [topicOpen, setTopicOpen] = useState(false);
  const requests = useRef({ categories: 0, questions: 0 });

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

  useEffect(() => {
    const pending = requests.current;
    void loadCategories();
    return () => {
      pending.categories++;
      pending.questions++;
    };
  }, [loadCategories]);

  useEffect(() => {
    const pending = requests.current;
    if (categoryId) void loadQuestions(categoryId);
    return () => {
      pending.questions++;
    };
  }, [categoryId, loadQuestions]);

  const selectedCategory = categories.find((item) => item.id === categoryId);
  const levels = buildStudyLevels(questions, studyTrackUsesMocks, DEMO_CURRENT_LEVEL);
  return {
    categories,
    categoryId,
    selectedCategory,
    levels,
    questions,
    status,
    questionStatus,
    openedLevel,
    topicOpen,
    setTopicOpen,
    isDemo: studyTrackUsesMocks,
    progress: studyTrackUsesMocks && levels.length ? 81 : null,
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
    },
    retryQuestions: () => {
      if (categoryId) {
        setQuestionStatus('loading');
        void loadQuestions(categoryId);
      }
    },
    openLevel: setOpenedLevel,
    closeLevel: () => setOpenedLevel(null),
  };
}
