import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { chatbotModel } from '@/models/chatbotModel';
import type { ChatMessage, ConversationSummary } from '@/types/chatbot';
import { userModel } from '@/models/userModel';

const MAX_MESSAGE_LENGTH = 500;

function createErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return 'Nao foi possivel falar com o assistente. Verifique sua conexao e tente novamente.';

  switch (error.status) {
    case 400:
      return 'A mensagem nao esta valida. Revise o texto e tente novamente.';
    case 403:
      return 'O assistente nao esta autorizado no momento. Tente novamente mais tarde.';
    case 404:
      return 'Nao encontramos os dados necessarios para processar sua solicitacao.';
    case 422:
      return 'Nao consegui entender todos os dados. Tente explicar de outra forma.';
    case 429:
      return 'O assistente recebeu muitas solicitacoes. Aguarde um momento e tente novamente.';
    case 502:
    case 503:
    case 504:
      return 'O assistente esta indisponivel no momento. Tente novamente em instantes.';
    default:
      return 'Nao foi possivel concluir sua solicitacao. Tente novamente.';
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
      setConversationsError('Nao foi possivel carregar suas conversas.');
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
        if (active) setConversationsError('Nao foi possivel carregar suas conversas.');
      } finally {
        if (active) setIsLoadingConversations(false);
      }
    }

    void loadInitialConversations();
    return () => {
      active = false;
    };
  }, []);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    const messageId = `user-${Date.now()}`;
    setDraft('');
    setErrorMessage(null);
    setMessages((current) => [...current, { id: messageId, role: 'user', status: 'sending', text }]);
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
      void loadConversations();
    } catch (error) {
      setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, status: 'error' } : message)));
      setDraft(text);
      setErrorMessage(createErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, loadConversations]);

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
    sendMessage,
    setDraft: (value: string) => {
      setDraft(value.slice(0, MAX_MESSAGE_LENGTH));
      setErrorMessage(null);
    },
    setIsMenuOpen,
  };
}
