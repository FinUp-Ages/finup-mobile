import { httpClient } from '@/config/httpClient';
import type { Category } from '@/types/transaction';

/**
 * MODEL - categorias disponiveis (do usuario + padrao do sistema).
 *
 * GET /api/v1/categories so existe em origin/develop do backend por enquanto
 * - se a branch local nao tiver o endpoint, a chamada falha e o ViewModel
 * trata isso via friendlyMessageFromError, igual a qualquer outro erro de
 * rede.
 */
export const categoriesModel = {
  listAvailable: () => httpClient.get<Category[]>('/api/v1/categories'),
};
