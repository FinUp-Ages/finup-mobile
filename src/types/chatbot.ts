export type ChatMessageRole = 'assistant' | 'user';
export type ChatMessageStatus = 'error' | 'sending' | 'sent';

export type AiModel = 'AMAZON_LITE' | 'ANTHROPIC' | 'GPT' | 'MAGISTRAL';

export interface AiAssistantRequest {
  message: string;
  model?: AiModel;
}

export interface TransactionSummary {
  id: string;
  amount: number;
  description: string;
  type: string;
}

export interface AiAssistantResponse {
  action: string;
  message: string;
  transaction: TransactionSummary | null;
}

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
  transaction?: TransactionSummary | null;
}
