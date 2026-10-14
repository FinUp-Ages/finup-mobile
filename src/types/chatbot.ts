import type { TransactionResponse } from '@/types/transaction';

export type ChatMessageRole = 'assistant' | 'user';
export type ChatMessageStatus = 'error' | 'sending' | 'sent';

/**
 * Espelha AiAssistantRequest.java (POST /api/v1/ai/assistant). Sem
 * `conversationId` o back abre uma conversa nova e devolve o id dela.
 */
export interface AiAssistantRequest {
  message: string;
  conversationId?: string;
}

/**
 * Espelha AiAssistantResponse.java: `transaction` vem quando a acao cria uma;
 * `conversationId` vem nulo se o back nao conseguiu gravar o historico (a acao
 * foi executada mesmo assim).
 */
export interface AiAssistantResponse {
  action: string;
  message: string;
  transaction: TransactionResponse | null;
  conversationId: string | null;
}

/** Espelha ConversationResponse.java (GET /api/v1/assistant/conversations). */
export interface ConversationSummary {
  id: string;
  title: string | null;
  updatedAt: string;
  messageCount: number;
}

/** Espelha ConversationMessageResponse.java (GET /api/v1/assistant/conversations/{id}/messages). */
export interface ConversationMessage {
  role: 'USER' | 'ASSISTANT';
  text: string;
  action: string | null;
  createdAt: string;
}

/** Etapa da mensagem de voz no composer. */
export type VoiceStatus = 'idle' | 'starting' | 'recording' | 'processing';

/**
 * Gravacao de uma mensagem de voz, so para a animacao que transforma a forma de
 * onda no texto: o audio nao e guardado e o back recebe apenas a transcricao.
 * `levels` sao as barras da forma de onda, 0..1.
 */
export interface VoiceRecording {
  levels: number[];
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  status: ChatMessageStatus;
  text: string;
  action?: string | null;
  transaction?: TransactionResponse | null;
  /** Presente quando a mensagem do usuario acabou de ser gravada por voz: anima a transcricao. */
  voice?: VoiceRecording;
}
