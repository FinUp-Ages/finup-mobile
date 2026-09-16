import { httpClient } from '@/config/httpClient';
import type { CadastroFormData } from '@/types/cadastro';

type UserResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

/**
 * MODEL - envio do cadastro.
 *
 * Cognito ainda nao esta configurado (User Pool pendente de definicao com o
 * time), entao por enquanto so a Etapa 1 (nome/e-mail) e enviada, via POST
 * /api/v1/users. Quando o Cognito entrar, isto passa a ser: (1) sign-up real
 * no Cognito com email/senha, (2) POST /api/v1/users usando a identidade
 * resultante, (3) PATCH /api/v1/users/me/additional-info com os dados da
 * Etapa 2. Nem a View nem o ViewModel mudam - so esta funcao ganha o restante
 * da implementacao.
 *
 * `celular`, `profissao`, `birthDate`, `monthlyIncome` e `senha` nao entram no
 * payload: nao existem na modelagem atual do backend, entao nao ha para onde
 * envia-los ainda.
 */
export async function submitCadastro(data: CadastroFormData): Promise<UserResponse> {
  const payload = {
    name: `${data.nome.trim()} ${data.sobrenome.trim()}`.trim(),
    email: data.email.trim().toLowerCase(),
  };

  return httpClient.post<UserResponse>('/api/v1/users', payload);
}
