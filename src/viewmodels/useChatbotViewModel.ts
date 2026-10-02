import { useCallback, useEffect, useRef, useState } from 'react';
import { HttpError } from '@/config/httpClient';
import { chatbotModel } from '@/models/chatbotModel';
import type { ChatMessage, ConversationMessage, ConversationSummary } from '@/types/chatbot';
import { userModel } from '@/models/userModel';

const MAX_MESSAGE_LENGTH = 500;
const CONVERSATIONS_ERROR = 'Não foi possível carregar suas conversas.';
const NOT_UNDERSTOOD = 'Não consegui entender todos os dados. Tente explicar de outra forma.';

function createErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return 'Não foi possível falar com o assistente. Verifique sua conexão e tente novamente.';

  switch (error.status) {
    case 400:
      return 'A mensagem não é válida. Revise o texto e tente novamente.';
    case 403:
      return 'O assistente não está autorizado no momento. Tente novamente mais tarde.';
    case 404:
      return 'Não encontramos esta conversa. Comece uma nova conversa pelo menu.';
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

function openConversationErrorMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 404) return 'Esta conversa não está mais disponível.';
  return 'Não foi possível abrir a conversa. Verifique sua conexão e tente novamente.';
}

function toChatMessages(conversationId: string, history: ConversationMessage[]): ChatMessage[] {
  return history.map((message, index) => ({
    action: message.action,
    id: `${conversationId}-${index}`,
    role: message.role === 'USER' ? 'user' : 'assistant',
    status: 'sent',
    text: message.text,
  }));
}

/**
 * VIEWMODEL - estado da tela e orquestracao do assistente autenticado.
 *
 * A conversa aberta e identificada pelo `conversationId` do back: null e uma
 * conversa nova, que ganha id na primeira resposta. Trocar de conversa fica
 * bloqueado enquanto uma mensagem esta sendo enviada, para a resposta nao cair
 * na conversa errada.
 */
export function useChatbotViewModel() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  // Conversa que a tela quer mostrar agora: descarta a resposta de uma conversa
  // aberta antes se a pessoa trocou de novo enquanto ela carregava.
  const shownConversation = useRef<string | null>(null);

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

  const openConversation = useCallback(
    async (id: string) => {
      if (isSending) return;
      setIsMenuOpen(false);
      if (id === conversationId && !messagesError && !isLoadingMessages) return;

      shownConversation.current = id;
      setConversationId(id);
      setMessages([]);
      setErrorMessage(null);
      setMessagesError(null);
      setIsLoadingMessages(true);

      try {
        const history = await chatbotModel.listMessages(id);
        if (shownConversation.current === id) setMessages(toChatMessages(id, history));
      } catch (error) {
        if (shownConversation.current === id) setMessagesError(openConversationErrorMessage(error));
      } finally {
        if (shownConversation.current === id) setIsLoadingMessages(false);
      }
    },
    [conversationId, isLoadingMessages, isSending, messagesError],
  );

  const retryOpenConversation = useCallback(() => {
    if (conversationId) void openConversation(conversationId);
  }, [conversationId, openConversation]);

  const newConversation = useCallback(() => {
    if (isSending) return;
    shownConversation.current = null;
    setIsMenuOpen(false);
    setConversationId(null);
    setMessages([]);
    setErrorMessage(null);
    setMessagesError(null);
    setIsLoadingMessages(false);
  }, [isSending]);

  // Envia uma mensagem do usuario que ja esta na lista, na conversa aberta.
  const deliver = useCallback(
    async (messageId: string, text: string) => {
      setErrorMessage(null);
      setIsSending(true);

      try {
        const response = await chatbotModel.sendMessage({ message: text, ...(conversationId ? { conversationId } : {}) });
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
        // Nulo quando o back nao conseguiu gravar o historico: segue na conversa atual.
        if (response.conversationId) {
          shownConversation.current = response.conversationId;
          setConversationId(response.conversationId);
        }
        // O turno foi gravado: titulo, ordem e contagem do menu mudaram.
        void loadConversations();
      } catch (error) {
        if (error instanceof HttpError && error.status === 422) {
          // Chegou, mas o assistente nao entendeu: a resposta vira fala dele e
          // reenviar o mesmo texto nao adianta. O back nao grava esse turno.
          setMessages((current) => [
            ...current.map((message): ChatMessage => (message.id === messageId ? { ...message, status: 'sent' } : message)),
            { id: `assistant-${Date.now()}`, role: 'assistant', status: 'sent', text: error.detail ?? NOT_UNDERSTOOD },
          ]);
        } else {
          setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, status: 'error' } : message)));
          setErrorMessage(createErrorMessage(error));
        }
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, loadConversations],
  );

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || isSending || isLoadingMessages) return;

    const messageId = `user-${Date.now()}`;
    setDraft('');
    setMessages((current) => [...current, { id: messageId, role: 'user', status: 'sending', text }]);
    void deliver(messageId, text);
  }, [deliver, draft, isLoadingMessages, isSending]);

  // Reenvia a ultima mensagem que falhou no proprio balao, sem duplicar o texto.
  const retryLastMessage = useCallback(() => {
    const failed = [...messages].reverse().find((message) => message.status === 'error');
    if (!failed || isSending) return;

    setMessages((current) => current.map((message) => (message.id === failed.id ? { ...message, status: 'sending' } : message)));
    void deliver(failed.id, failed.text);
  }, [deliver, isSending, messages]);

  return {
    conversationId,
    conversations,
    conversationsError,
    draft,
    errorMessage,
    hasConversation: conversationId !== null || messages.length > 0,
    isLoadingConversations,
    isLoadingMessages,
    isMenuOpen,
    isSending,
    loadConversations,
    messages,
    messagesError,
    newConversation,
    openConversation,
    profileName: welcomeName,
    retryLastMessage,
    retryOpenConversation,
    sendMessage,
    setDraft: (value: string) => {
      setDraft(value.slice(0, MAX_MESSAGE_LENGTH));
      setErrorMessage(null);
    },
    setIsMenuOpen,
  };
}
