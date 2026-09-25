import { httpClient, HttpError } from '@/config/httpClient';
import type { CadastroFormData } from '@/types/cadastro';

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  birthDate?: string | null;
  monthlyIncome?: number | null;
  createdAt: string;
  updatedAt?: string;
};

export type AdditionalInfoPayload = {
  birthDate: string | null;
  monthlyIncome: number | null;
  phone?: string | null;
  celular?: string | null;
  telefone?: string | null;
  occupation?: string | null;
  profissao?: string | null;
};

function buildCognitoMockHeaders(data: CadastroFormData): Record<string, string> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const fullName = `${data.nome.trim()} ${data.sobrenome.trim()}`.trim();
  return {
    'X-Mock-Cognito-Sub': `mock-cognito-${normalizedEmail}`,
    'X-Mock-Cognito-Email': normalizedEmail,
    'X-Mock-Cognito-Name': fullName,
  };
}

/**
 * MODEL - envio da Etapa 1 do cadastro (POST /api/v1/users).
 */
export async function submitCadastro(
  data: CadastroFormData,
  customHeaders?: Record<string, string>,
): Promise<UserResponse> {
  const payload = {
    name: `${data.nome.trim()} ${data.sobrenome.trim()}`.trim(),
    email: data.email.trim().toLowerCase(),
  };

  const headers = customHeaders ?? buildCognitoMockHeaders(data);
  return httpClient.post<UserResponse>('/api/v1/users', payload, { headers });
}

/**
 * MODEL - envio dos dados adicionais das Etapas 2 e 3 (PATCH /api/v1/users/me/additional-info).
 *
 * Envia data de nascimento, renda mensal fixa, telefone/celular e profissao ao backend.
 */
export async function submitAdditionalInfo(
  data: CadastroFormData,
  customHeaders?: Record<string, string>,
): Promise<UserResponse> {
  const payload: AdditionalInfoPayload = {
    birthDate: data.birthDate || null,
    monthlyIncome: data.monthlyIncome
      ? Number(data.monthlyIncome.replace(',', '.'))
      : null,
    phone: data.celular.trim() || null,
    celular: data.celular.trim() || null,
    telefone: data.celular.trim() || null,
    occupation: data.profissao.trim() || null,
    profissao: data.profissao.trim() || null,
  };

  const headers = customHeaders ?? buildCognitoMockHeaders(data);
  return httpClient.patch<UserResponse>('/api/v1/users/me/additional-info', payload, {
    headers,
  });
}

/**
 * MODEL - fluxo completo do cadastro:
 * 1. Cria o usuario (Etapa 1: POST /api/v1/users)
 * 2. Envia os dados adicionais das Etapas 2 e 3 (PATCH /api/v1/users/me/additional-info)
 */
export async function submitCadastroCompleto(data: CadastroFormData): Promise<UserResponse> {
  const headers = buildCognitoMockHeaders(data);

  try {
    await submitCadastro(data, headers);
  } catch (error) {
    // Se o usuario ja foi criado em tentativa anterior (409), segue para atualizar os dados adicionais
    if (!(error instanceof HttpError && error.status === 409)) {
      throw error;
    }
  }

  return submitAdditionalInfo(data, headers);
}
