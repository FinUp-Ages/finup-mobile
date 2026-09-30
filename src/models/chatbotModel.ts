import { httpClient } from '@/config/httpClient';
import type { AiAssistantRequest, AiAssistantResponse, ConversationSummary } from '@/types/chatbot';

/**
 * MODEL - contratos atualmente disponiveis para o assistente.
 *
 * O POST e um comando de IA (podendo registrar transacoes), nao um chat com
 * historico. Centralizar essa diferenca aqui permite trocar o contrato quando
 * o backend expuser mensagens persistidas, sem acoplar a View a HTTP.
 */
export const chatbotModel = {
  listConversations: () => httpClient.get<ConversationSummary[]>('/api/v1/assistant/conversations'),
  sendMessage: (payload: AiAssistantRequest) => httpClient.post<AiAssistantResponse>('/api/v1/ai/assistant', payload),
};
