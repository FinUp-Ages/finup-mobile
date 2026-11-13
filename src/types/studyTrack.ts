/** C6 de leitura: sem rascunhos, progresso ou campos administrativos. */
export type StudyCategory = {
  id: string;
  name: string;
  description: string | null;
  publishedCount: number;
};

/** Conteudo publicado (C6, secao 4): o `type` vem dentro do JSON, nao no envelope. */
export type StudyPublishedContent =
  | {
      type: 'MULTIPLE_CHOICE';
      statement: string;
      options: { id?: string; text: string; correct?: boolean }[];
      correctOptionId?: string;
      explanation?: string;
    }
  | ({ type: 'FILL_BLANK' } & (
      | {
          title: string;
          statement: string;
          answers: string[];
          explanation?: string;
        }
      | {
          textWithBlanks: string;
          blanks: { index: number; expectedAnswer: string; acceptableAnswers: string[] }[];
          explanation: string;
        }
    ))
  | ({ type: 'LEARNING' } & (
      | { title: string; body: string }
      | {
          title: string;
          content: string;
          keyTakeaways: string[];
          tips?: string;
        }
    ));

export type StudyLearningContent = Extract<StudyPublishedContent, { type: 'LEARNING' }>;

/** Item de GET /categories/{id}/questions: o back devolve somente `{ id, published }`. */
export type StudyQuestion = { id: string; published: StudyPublishedContent };

export type StudyLevel = {
  question: StudyQuestion;
  number: number;
  /** 0 quando o nível não tem nota (não respondido ou leitura). */
  stars: number;
  reached: boolean;
};

/** Item de `levels` em GET /study-tracks/progress (C6): uma pergunta publicada = um nível. */
export type StudyLevelProgress = {
  level: number;
  questionId: string;
  completed: boolean;
  correct: boolean | null;
  stars: number | null;
};

/** Progresso de uma categoria. `percentage` é de acertos; `completionPercentage`, de avanço. */
export type StudyCategoryProgress = {
  categoryId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  gradableQuestions: number;
  stars: number | null;
  percentage: number;
  completionPercentage: number;
  /** Primeiro nível não concluído (1 sem respostas; o total com tudo concluído; 0 sem níveis). */
  currentLevel: number;
  levels: StudyLevelProgress[];
};

/** GET /api/v1/study-tracks/progress. */
export type StudyTrackProgress = {
  categories: StudyCategoryProgress[];
  total: {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    gradableQuestions: number;
    stars: number | null;
    percentage: number;
    completionPercentage: number;
  };
};
