import { httpClient } from '@/config/httpClient';
import type { ChatMessage, Conversation } from '@/types/chatbot';

/**
 * MODEL - historico e conversas do assistente no finup-backend.
 *
 * Consome os endpoints do assistente autenticado. A identidade do usuario
 * vem do access token injetado automaticamente pelo httpClient.
 */
export const assistantModel = {
  /**
   * Lista o historico de conversas do usuario autenticado ordenadas decrescente por atualizacao.
   */
  getConversations: (): Promise<Conversation[]> =>
    httpClient.get<Conversation[]>('/api/v1/assistant/conversations'),

  /**
   * Busca as mensagens de uma conversa especifica pelo ID.
   */
  getMessages: (conversationId: string): Promise<ChatMessage[]> =>
    httpClient.get<ChatMessage[]>(`/api/v1/assistant/conversations/${conversationId}/messages`),
};
