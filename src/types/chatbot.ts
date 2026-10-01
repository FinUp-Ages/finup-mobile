export type ChatMessageRole = 'assistant' | 'user';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
}
