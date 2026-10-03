import type { SignUpInput } from '@/models/authModel';
import type { AdditionalInfoPayload } from '@/models/userModel';
import type { CadastroFormData } from '@/types/cadastro';
import { INCOME_RANGES } from '@/utils/cadastroOptions';

// Celular mascarado ("(11) 99999-8888") -> E.164 brasileiro, o formato que o back valida.
function toE164(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11 ? `+55${digits}` : undefined;
}

/**
 * MODEL - traduz o formulario do cadastro para o que o Cognito e o back esperam.
 *
 * O envio em si fica com authModel (SignUp) e userModel (POST /users e PATCH
 * additional-info), orquestrados pelo useCadastroViewModel.
 *
 * O cadastro no Cognito leva so nome, e-mail, data e senha; celular e profissao
 * seguem no PATCH additional-info.
 */
export function toSignUpInput(data: CadastroFormData, username: string): SignUpInput {
  return {
    username,
    password: data.senha,
    email: data.email.trim().toLowerCase(),
    name: `${data.nome.trim()} ${data.sobrenome.trim()}`.trim(),
    birthdate: data.birthDate,
  };
}

export function toAdditionalInfo(data: CadastroFormData): AdditionalInfoPayload {
  const payload: AdditionalInfoPayload = {};
  if (data.birthDate) {
    payload.birthDate = data.birthDate;
  }
  const income = INCOME_RANGES.find((range) => range.value === data.monthlyIncome);
  if (income) {
    payload.monthlyIncome = income.amount;
  }
  const phone = toE164(data.celular);
  if (phone) {
    payload.phone = phone;
  }
  if (data.profissao.trim()) {
    payload.profession = data.profissao.trim();
  }
  return payload;
}
