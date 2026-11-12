import { StudyQuestionModal } from '@/components/learning/StudyQuestionModal';
import type { StudyAnswersResponse } from '@/types/studySession';
import type { StudyQuestion } from '@/types/studyTrack';
import { useStudySessionViewModel } from '@/viewmodels/useStudySessionViewModel';

/** A View liga o ViewModel ao modal; componentes de apresentação não acessam Models. */
export default function StudySessionScreen({
  topic,
  onClose,
  ...sessionProps
}: {
  categoryId: string;
  topic: string;
  questions: StudyQuestion[];
  startQuestionId: string;
  onSaved: (result: StudyAnswersResponse) => void;
  onClose: () => void;
}) {
  const vm = useStudySessionViewModel(sessionProps);
  return <StudyQuestionModal vm={vm} topic={topic} onClose={onClose} />;
}
