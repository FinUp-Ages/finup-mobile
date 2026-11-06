import type { StudyCategory, StudyQuestion } from '@/types/studyTrack';

const publishedAt = '2026-10-20T19:00:00Z';
const ids = [
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'c3d4e5f6-a7b8-49c0-8d1e-2f3a4b5c6d7e',
];

/** Mesmo envelope dos GETs C6. Dados de demonstracao nao incluem rascunhos. */
export const studyCategoriesMock: StudyCategory[] = [
  {
    id: ids[0],
    name: 'Renda Fixa',
    description: 'Conheça os investimentos de renda fixa.',
    publishedCount: 5,
  },
  {
    id: ids[1],
    name: 'Ações',
    description: 'Primeiros passos na renda variável.',
    publishedCount: 3,
  },
  { id: ids[2], name: 'Poupança', description: 'Aprenda a guardar dinheiro.', publishedCount: 2 },
];

const learning = (id: string, title: string, content: string): StudyQuestion => ({
  id,
  type: 'LEARNING',
  publishedAt,
  published: {
    title,
    content,
    keyTakeaways: [
      'Entenda os riscos antes de investir.',
      'Compare liquidez, prazo e rentabilidade.',
    ],
  },
});

export function getStudyQuestionsMock(categoryId: string): StudyQuestion[] {
  if (categoryId === ids[0])
    return [
      learning(
        '11111111-2222-4333-8444-555555555551',
        'O que é um CDB?',
        'O Certificado de Depósito Bancário é um título de renda fixa emitido por bancos. Ao investir, você empresta dinheiro à instituição e recebe juros.',
      ),
      {
        id: '11111111-2222-4333-8444-555555555552',
        type: 'MULTIPLE_CHOICE',
        publishedAt,
        published: {
          statement: 'No CDB, os juros compostos incidem sobre:',
          options: [
            { id: 'A', text: 'Só o valor investido no começo' },
            { id: 'B', text: 'O valor investido e os juros já ganhos' },
            { id: 'C', text: 'Um valor fixo definido pelo banco' },
          ],
          correctOptionId: 'B',
          explanation:
            'Nos juros compostos, os rendimentos passam a fazer parte da base de cálculo.',
        },
      },
      {
        id: '11111111-2222-4333-8444-555555555553',
        type: 'FILL_BLANK',
        publishedAt,
        published: {
          textWithBlanks:
            'Para uma reserva de emergência, prefira alta {liquidez} e baixo {risco}.',
          blanks: [
            { index: 0, expectedAnswer: 'liquidez', acceptableAnswers: ['liquidez'] },
            { index: 1, expectedAnswer: 'risco', acceptableAnswers: ['risco'] },
          ],
          explanation: 'A reserva deve estar disponível quando você precisar dela.',
        },
      },
      learning(
        '11111111-2222-4333-8444-555555555554',
        'CDI e Selic',
        'O CDI é uma referência de rentabilidade da renda fixa e acompanha a taxa básica de juros, a Selic.',
      ),
      learning(
        '11111111-2222-4333-8444-555555555555',
        'Liquidez e vencimento',
        'Confira quando você pode resgatar seu investimento antes de aplicar.',
      ),
    ];
  const category = studyCategoriesMock.find((item) => item.id === categoryId);
  return Array.from({ length: category?.publishedCount ?? 0 }, (_, index) =>
    learning(
      `22222222-2222-4222-8222-${String((ids.indexOf(categoryId) + 1) * 100 + index).padStart(12, '0')}`,
      `${category?.name}: primeiros passos ${index + 1}`,
      category?.description ?? '',
    ),
  );
}
