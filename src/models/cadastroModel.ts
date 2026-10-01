import type { SignUpInput } from '@/models/authModel';
import type { AdditionalInfoPayload } from '@/models/userModel';
import type { CadastroFormData } from '@/types/cadastro';
import { parseCurrencyToNumber } from '@/utils/masks';

/**
 * MODEL - traduz o formulario do cadastro para o que o Cognito e o back esperam.
 *
 * O envio em si fica com authModel (SignUp) e userModel (POST /users e PATCH
 * additional-info), orquestrados pelo useCadastroViewModel.
 *
 * `celular` e `profissao` nunca entram em nenhum payload: nao existem na
 * modelagem atual do backend, entao nao ha para onde envia-los ainda.
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
  if (data.monthlyIncome.trim()) {
    const parsed = parseCurrencyToNumber(data.monthlyIncome);
    if (parsed !== undefined) {
      payload.monthlyIncome = parsed;
    }
  }
  return payload;
}
