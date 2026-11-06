/** C6 de leitura: sem rascunhos, progresso ou campos administrativos. */
export type StudyCategory = {
  id: string;
  name: string;
  description: string | null;
  publishedCount: number;
};

type PublishedQuestion<T, P> = { id: string; type: T; published: P; publishedAt: string };
export type StudyQuestion =
  | PublishedQuestion<
      'MULTIPLE_CHOICE',
      {
        statement: string;
        options: { id?: string; text: string; correct?: boolean }[];
        correctOptionId?: string;
        explanation?: string;
      }
    >
  | PublishedQuestion<
      'FILL_BLANK',
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
    >
  | PublishedQuestion<
      'LEARNING',
      | { title: string; body: string }
      | {
          title: string;
          content: string;
          keyTakeaways: string[];
          tips?: string;
        }
    >;

export type StudyLevel = {
  question: StudyQuestion;
  number: number;
  stars: number;
  reached: boolean;
};
