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
  stars: number;
  reached: boolean;
};
