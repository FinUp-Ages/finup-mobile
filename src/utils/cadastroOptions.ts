/**
 * Opcoes dos dropdowns da Etapa 2 do cadastro.
 *
 * Renda: o back guarda um valor (monthlyIncome), nao uma faixa. Cada faixa envia
 * o seu LIMITE SUPERIOR (a ultima, "mais de 50.000", envia 50000).
 */
export type IncomeRange = { value: string; label: string; amount: number };

export const INCOME_RANGES: IncomeRange[] = [
  { value: 'ate-2500', label: 'Até R$ 2.500', amount: 2500 },
  { value: '2500-5000', label: 'De R$ 2.500 a R$ 5.000', amount: 5000 },
  { value: '5000-10000', label: 'De R$ 5.000 a R$ 10.000', amount: 10000 },
  { value: '10000-20000', label: 'De R$ 10.000 a R$ 20.000', amount: 20000 },
  { value: '20000-50000', label: 'De R$ 20.000 a R$ 50.000', amount: 50000 },
  { value: 'mais-50000', label: 'Mais de R$ 50.000', amount: 50000 },
];

export const PROFESSIONS: string[] = [
  'Administrador(a)',
  'Advogado(a)',
  'Analista de sistemas',
  'Arquiteto(a)',
  'Autônomo(a)',
  'Auxiliar administrativo',
  'Bancário(a)',
  'Cabeleireiro(a)',
  'Contador(a)',
  'Designer',
  'Desenvolvedor(a)',
  'Dentista',
  'Economista',
  'Empresário(a)',
  'Enfermeiro(a)',
  'Engenheiro(a)',
  'Estudante',
  'Farmacêutico(a)',
  'Fisioterapeuta',
  'Motorista',
  'Médico(a)',
  'Nutricionista',
  'Professor(a)',
  'Psicólogo(a)',
  'Servidor(a) público(a)',
  'Vendedor(a)',
  'Aposentado(a) / Pensionista',
  'Outra',
];
