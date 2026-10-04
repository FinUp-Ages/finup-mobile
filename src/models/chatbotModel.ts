import { httpClient } from '@/config/httpClient';
import type {
  AiAssistantRequest,
  AiAssistantResponse,
  ConversationMessage,
  ConversationSummary,
} from '@/types/chatbot';

/**
 * MODEL - contratos do assistente (finup-backend PR #39).
 *
 * O POST interpreta a mensagem e executa a acao (registrar transacao, feedback
 * financeiro) e grava o turno na conversa: sem `conversationId` abre uma nova.
 * O historico fica no back; aqui so os caminhos e os tipos.
 */

// O POST passa pelo modelo de IA (Bedrock) e pode levar bem mais que o timeout
// padrao do httpClient (15s).
const ASSISTANT_TIMEOUT_MS = 60000;

export const chatbotModel = {
  listConversations: () => httpClient.get<ConversationSummary[]>('/api/v1/assistant/conversations'),
  listMessages: (conversationId: string) =>
    httpClient.get<ConversationMessage[]>(`/api/v1/assistant/conversations/${encodeURIComponent(conversationId)}/messages`),
  sendMessage: (payload: AiAssistantRequest) =>
    httpClient.post<AiAssistantResponse>('/api/v1/ai/assistant', payload, {
      timeoutMs: ASSISTANT_TIMEOUT_MS,
    }),
};
