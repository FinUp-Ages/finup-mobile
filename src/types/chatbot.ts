export type ChatMessageRole = 'assistant' | 'user';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
}
