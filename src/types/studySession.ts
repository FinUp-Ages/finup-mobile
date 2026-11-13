/** Contratos C6 de resposta, isolados dos tipos de apresentação da trilha. */
export type StudyContent =
  | {
      type: 'MULTIPLE_CHOICE';
      title?: string;
      statement: string;
      options: { text: string; correct: boolean }[];
      explanation?: string;
    }
  | {
      type: 'FILL_BLANK';
      title: string;
      statement: string;
      answers: string[];
      explanation?: string;
    }
  | { type: 'LEARNING'; title: string; body: string };

export type StudySessionQuestion = { id: string; published: StudyContent };

export type StudyAnswersRequest = {
  categoryId: string;
  answers: { questionId: string; answer: string | null }[];
};

export type StudyAnswersResponse = {
  categoryId: string;
  stars: number | null;
  correctCount: number;
  gradableCount: number;
  answers: {
    questionId: string;
    answer: string | null;
    correct: boolean | null;
    submittedAt: string;
  }[];
};
