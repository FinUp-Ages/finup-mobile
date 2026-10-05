/**
 * TYPES - dados do fluxo de cadastro (3 etapas, ver Figma).
 *
 * `monthlyIncome` guarda o `value` da faixa escolhida (utils/cadastroOptions);
 * `celular` e `profissao` seguem no PATCH additional-info.
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
 * `form` = Etapas 1 a 3. `code` = confirmacao do e-mail (codigo do Cognito).
 * `finishing` = e-mail confirmado; falta login + criacao no back.
 */
export type CadastroPhase = 'form' | 'code' | 'finishing';

/**
 * `true` = campo obrigatorio vazio (so borda vermelha, sem mensagem - nao faz
 * sentido dizer "e obrigatorio" pra um campo que a pessoa ainda nem tentou
 * preencher). Uma `string` = valor preenchido mas invalido (borda vermelha COM
 * a mensagem, ex.: "deve ser um e-mail valido").
 */
export type CadastroFormErrors = Partial<Record<keyof CadastroFormData, string | true>>;
