import { httpClient } from '@/config/httpClient';
import type { Category } from '@/types/transaction';

/** MODEL - categorias disponiveis (do usuario + padrao do sistema). */
export const categoriesModel = {
  listAvailable: () => httpClient.get<Category[]>('/api/v1/categories'),
};
