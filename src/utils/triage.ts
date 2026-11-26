import type { Answer, Answers, TriageQuestion } from '../types/triage';

/** Monthly income question (questionnaire v2): the backend computes the FinUp Score from it. */
export const MONTHLY_INCOME_QUESTION = 'MONTHLY_INCOME';

/**
 * Prefill the income with the profile one (GET /users/me), which is the current value: it wins
 * over the last triage and covers users who gave their income at sign-up and never took the
 * triage. Without a profile income the answers are kept and the user fills in the question.
 */
export function withCurrentIncome(answers: Answers, income: number | null | undefined): Answers {
  return typeof income === 'number' && Number.isFinite(income) && income >= 0
    ? { ...answers, [MONTHLY_INCOME_QUESTION]: income }
    : answers;
}

export function visibleQuestions(questions: TriageQuestion[], answers: Answers) {
  const accepted: Answers = {};
  return questions.filter((question) => {
    const condition = question.requiredWhen;
    const visible = !condition || accepted[condition.questionId] === condition.equals;
    if (visible && answers[question.id] !== undefined) accepted[question.id] = answers[question.id];
    return visible;
  });
}

export function answerError(question: TriageQuestion, value: Answer | undefined): string | null {
  if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return question.required ? 'Responda esta pergunta para continuar.' : null;
  }
  switch (question.type) {
    case 'BOOLEAN':
      return typeof value === 'boolean' ? null : 'Escolha Sim ou Não.';
    case 'NUMBER': {
      if (typeof value !== 'number' || !Number.isFinite(value)) return 'Informe um número válido.';
      if ((question.min !== null && value < question.min) || (question.max !== null && value > question.max)) {
        return `Informe um valor entre ${question.min ?? 0} e ${question.max ?? 'o limite permitido'}.`;
      }
      const factor = 10 ** (question.decimals ?? 0);
      return Math.abs(value * factor - Math.round(value * factor)) > 0.00001
        ? `Use no máximo ${question.decimals ?? 0} casas decimais.` : null;
    }
    case 'SINGLE_CHOICE':
      return typeof value === 'string' && question.options?.some((option) => option.value === value)
        ? null : 'Escolha uma opção válida.';
    case 'MULTIPLE_CHOICE':
      return Array.isArray(value) && new Set(value).size === value.length &&
        value.every((item) => question.options?.some((option) => option.value === item))
        ? null : 'Escolha opções válidas.';
  }
}

/** Discard unknown, invalid and hidden answers after a questionnaire update. */
export function compatibleAnswers(questions: TriageQuestion[], answers: Answers): Answers {
  const valid: Answers = {};
  for (const question of questions) {
    if (answers[question.id] !== undefined && !answerError(question, answers[question.id])) {
      valid[question.id] = answers[question.id];
    }
  }
  return submissionAnswers(questions, valid);
}

export function submissionAnswers(questions: TriageQuestion[], answers: Answers): Answers {
  return Object.fromEntries(visibleQuestions(questions, answers)
    .filter((question) => answers[question.id] !== undefined && answers[question.id] !== '')
    .map((question) => [question.id, answers[question.id]]));
}
