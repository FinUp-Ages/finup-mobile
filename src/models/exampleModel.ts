import { httpClient } from '@/config/httpClient';
import type { Example, ExamplePayload } from '@/types/example';

/**
 * MODEL - camada fina de acesso a API.
 *
 * So sabe QUAL endpoint chamar e QUAL tipo volta. Nao guarda estado nem decide
 * nada: isso e trabalho do ViewModel.
 *
 * Regra de ouro: uma View NUNCA importa um Model direto - sempre via ViewModel.
 *
 * TODO: implementar em tarefa futura - um model por recurso real da API.
 */
export const exampleModel = {
  listAll: () => httpClient.get<Example[]>('/api/examples'),

  findById: (id: string) => httpClient.get<Example>(`/api/examples/${id}`),

  create: (payload: ExamplePayload) => httpClient.post<Example>('/api/examples', payload),
};
