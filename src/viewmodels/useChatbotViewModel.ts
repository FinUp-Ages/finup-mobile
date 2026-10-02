import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { chatbotModel } from '@/models/chatbotModel';
import type { ChatMessage, ConversationSummary } from '@/types/chatbot';
import { userModel } from '@/models/userModel';

const MAX_MESSAGE_LENGTH = 500;
const CONVERSATIONS_ERROR = 'Não foi possível carregar suas conversas.';

function createErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return 'Não foi possível falar com o assistente. Verifique sua conexão e tente novamente.';

  switch (error.status) {
    case 400:
      return 'A mensagem não é válida. Revise o texto e tente novamente.';
    case 403:
      return 'O assistente não está autorizado no momento. Tente novamente mais tarde.';
    case 404:
      return 'Não encontramos os dados necessários para processar sua solicitação.';
    case 422:
      return 'Não consegui entender todos os dados. Tente explicar de outra forma.';
    case 429:
      return 'O assistente recebeu muitas solicitações. Aguarde um momento e tente novamente.';
    case 502:
    case 503:
    case 504:
      return 'O assistente está indisponível no momento. Tente novamente em instantes.';
    default:
      return 'Não foi possível concluir sua solicitação. Tente novamente.';
  }
}

/** VIEWMODEL - estado da tela e orquestracao do assistente autenticado. */
export function useChatbotViewModel() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWelcomeName() {
      try {
        const user = await userModel.getMe();
        const firstName = user.name.trim().split(/\s+/)[0] ?? null;
        if (active) setWelcomeName(firstName);
      } catch {
        if (active) setWelcomeName(null);
      }
    }

    void loadWelcomeName();
    return () => {
      active = false;
    };
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setConversationsError(null);
    try {
      setConversations(await chatbotModel.listConversations());
    } catch {
      setConversationsError(CONVERSATIONS_ERROR);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialConversations() {
      try {
        const response = await chatbotModel.listConversations();
        if (active) setConversations(response);
      } catch {
        if (active) setConversationsError(CONVERSATIONS_ERROR);
      } finally {
        if (active) setIsLoadingConversations(false);
      }
    }

    void loadInitialConversations();
    return () => {
      active = false;
    };
  }, []);

  // Envia uma mensagem do usuario que ja esta na lista. O POST nao grava a
  // conversa no back, entao nao ha historico para recarregar depois.
  const deliver = useCallback(async (messageId: string, text: string) => {
    setErrorMessage(null);
    setIsSending(true);

    try {
      const response = await chatbotModel.sendMessage({ message: text });
      const assistantMessage: ChatMessage = {
        action: response.action,
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        status: 'sent',
        text: response.message,
        transaction: response.transaction,
      };

      setMessages((current) => [
        ...current.map((message): ChatMessage => (message.id === messageId ? { ...message, status: 'sent' } : message)),
        assistantMessage,
      ]);
    } catch (error) {
      setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, status: 'error' } : message)));
      setErrorMessage(createErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || isSending) return;

    const messageId = `user-${Date.now()}`;
    setDraft('');
    setMessages((current) => [...current, { id: messageId, role: 'user', status: 'sending', text }]);
    void deliver(messageId, text);
  }, [deliver, draft, isSending]);

  // Reenvia a ultima mensagem que falhou no proprio balao, sem duplicar o texto.
  const retryLastMessage = useCallback(() => {
    const failed = [...messages].reverse().find((message) => message.status === 'error');
    if (!failed || isSending) return;

    setMessages((current) => current.map((message) => (message.id === failed.id ? { ...message, status: 'sending' } : message)));
    void deliver(failed.id, failed.text);
  }, [deliver, isSending, messages]);

  return {
    conversations,
    conversationsError,
    draft,
    errorMessage,
    isLoadingConversations,
    isMenuOpen,
    isSending,
    loadConversations,
    messages,
    profileName: welcomeName,
    retryLastMessage,
    sendMessage,
    setDraft: (value: string) => {
      setDraft(value.slice(0, MAX_MESSAGE_LENGTH));
      setErrorMessage(null);
    },
    setIsMenuOpen,
  };
}
