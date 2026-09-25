import type { CadastroFormData } from '@/types/cadastro';

/**
 * MODEL - envio do cadastro.
 *
 * Mock completo, sem chamada de rede: o Cognito ainda nao esta configurado (User
 * Pool pendente de definicao com o time), entao nao ha contrato real para chamar.
 *
 * Quando o Cognito entrar, isto passa a ser: (1) sign-up real no Cognito com
 * email/senha, (2) POST /api/v1/users usando a identidade resultante, (3) PATCH
 * /api/v1/users/me/additional-info com os dados da Etapa 2. Nem a View nem o
 * ViewModel mudam - so esta funcao ganha implementacao real.
 *
 * `celular` e `profissao` nunca entram no payload: nao existem na modelagem atual
 * do backend, entao nao ha para onde envia-los ainda.
 */
export async function submitCadastroMock(data: CadastroFormData): Promise<void> {
  const payloadEtapa1 = {
    name: `${data.nome.trim()} ${data.sobrenome.trim()}`.trim(),
    email: data.email.trim().toLowerCase(),
  };
  const payloadEtapa2 = {
    birthDate: data.birthDate,
    monthlyIncome: data.monthlyIncome ? Number(data.monthlyIncome.replace(',', '.')) : null,
  };

  await new Promise((resolve) => setTimeout(resolve, 800));

  if (__DEV__) {
    console.log('[mock] cadastro enviado (nenhuma chamada de rede real)', {
      payloadEtapa1,
      payloadEtapa2,
    });
  }
}
