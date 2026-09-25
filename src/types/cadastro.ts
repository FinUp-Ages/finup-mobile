/**
 * TYPES - dados do fluxo de cadastro (3 etapas, ver Figma).
 *
 * `celular` e `profissao` nao tem correspondencia na modelagem atual do backend
 * (Users so tem Name, Email, BirthDate, MonthlyIncome, FinancialProfile). Ficam
 * aqui porque aparecem no Figma e a tela precisa coleta-los visualmente, mas sao
 * pendencia de definicao - nunca sao enviados em nenhum envio.
 */
export type CadastroFormData = {
  nome: string;
  sobrenome: string;
  email: string;
  celular: string;
  birthDate: string;
  monthlyIncome: string;
  profissao: string;
  senha: string;
  confirmarSenha: string;
};

export type CadastroStep = 1 | 2 | 3;

/**
 * `true` = campo obrigatorio vazio (so borda vermelha, sem mensagem - nao faz
 * sentido dizer "e obrigatorio" pra um campo que a pessoa ainda nem tentou
 * preencher). Uma `string` = valor preenchido mas invalido (borda vermelha COM
 * a mensagem, ex.: "deve ser um e-mail valido").
 */
export type CadastroFormErrors = Partial<Record<keyof CadastroFormData, string | true>>;
