export type Answer = string | number | boolean | string[];
export type Answers = Record<string, Answer>;
export type TriageQuestion = {
  id: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMBER' | 'BOOLEAN';
  required: boolean;
  options: { value: string; label: string }[] | null;
  min: number | null;
  max: number | null;
  decimals: number | null;
  requiredWhen: { questionId: string; equals: boolean } | null;
};
export type Questionnaire = { version: number; questions: TriageQuestion[] };
export type SavedAnswers = { version: number; answers: Answers; completedAt: string };
export type AssessmentResponse = {
  completedAt: string;
  assessment: {
    profile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    summary: string;
    risks: {
      code: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      title: string;
      description: string;
      suggestion: string;
    }[];
  };
};
export const investorProfileLabels = {
  CONSERVATIVE: 'Conservador',
  MODERATE: 'Moderado',
  AGGRESSIVE: 'Arrojado',
} as const;
