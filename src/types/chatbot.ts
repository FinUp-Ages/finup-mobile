import type { TransactionResponse } from '@/types/transaction';

export type ChatMessageRole = 'assistant' | 'user';
export type ChatMessageStatus = 'error' | 'sending' | 'sent';

/** Espelha AiAssistantRequest.java (POST /api/v1/ai/assistant). */
export interface AiAssistantRequest {
  message: string;
}

/** Espelha AiAssistantResponse.java: `transaction` vem quando a acao cria uma. */
export interface AiAssistantResponse {
  action: string;
  message: string;
  transaction: TransactionResponse | null;
}

/** Espelha ConversationResponse.java (GET /api/v1/assistant/conversations). */
export interface ConversationSummary {
  id: string;
  title: string | null;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  status: ChatMessageStatus;
  text: string;
  action?: string;
  transaction?: TransactionResponse | null;
}
