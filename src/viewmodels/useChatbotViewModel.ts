import { useCallback, useEffect, useState } from 'react';
import { assistantModel } from '@/models/assistantModel';
import { userModel } from '@/models/userModel';
import type { ChatMessage, Conversation } from '@/types/chatbot';

const MOCK_REPLY = `Podemos organizar tranquilamente! Para juntar R$ 20.000 em 6 meses, o primeiro passo e transformar a meta em valores menores:\n\n• 🎯 Meta total: R$ 20.000\n• 📆 6 meses\n• 💵 Por mes: R$ 3.333\n• 💰 Por semana: R$ 769\n• 🔎 Por dia: R$ 110\n\nMas eu nao faria simplesmente “guardar R$ 3.333 por mes”. Da para organizar melhor, principalmente se tua renda nao for igual todos os meses.`;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * VIEWMODEL - estado do chatbot e historico de conversas.
 *
 * Gerencia as mensagens da conversa atual, o perfil do usuario e a listagem/selecao
 * do historico de conversas consumidas da API do assistente.
 */
export function useChatbotViewModel() {
  const [draft, setDraft] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  // Historico de conversas
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadWelcomeName() {
      try {
        const user = await userModel.getMe();
        const firstName = user.name.trim().split(/\s+/)[0] ?? null;
        if (active) setWelcomeName(firstName);
      } catch {
        // A saudacao continua generica se o perfil nao puder ser carregado.
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
    try {
      const list = await assistantModel.getConversations();
      setConversations(list);
    } catch {
      // Se falhar (ex: offline ou backend ainda iniciando), mantem lista anterior
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
    void loadConversations();
  }, [loadConversations]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setCurrentConversationId(conversationId);
      setIsMenuOpen(false);

      // Tenta buscar as mensagens do backend se o endpoint ja estiver disponivel
      try {
        const remoteMessages = await assistantModel.getMessages(conversationId);
        if (remoteMessages && remoteMessages.length > 0) {
          setMessages(remoteMessages);
          return;
        }
      } catch {
        // Endpoint ainda em desenvolvimento no backend: mock gracioso da conversa selecionada
      }

      // Fallback enquanto GET /messages esta em andamento no back:
      const selected = conversations.find((c) => c.id === conversationId);
      const title = selected?.title ?? 'Conversa anterior';
      setMessages([
        { id: `hist-user-${conversationId}`, role: 'user', text: title },
        { id: `hist-assistant-${conversationId}`, role: 'assistant', text: MOCK_REPLY },
      ]);
    },
    [conversations],
  );

  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
    setDraft('');
    setIsMenuOpen(false);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    setDraft('');
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text }]);
    setIsSending(true);

    await wait(650);
    setMessages((current) => [
      ...current,
      { id: `assistant-${Date.now()}`, role: 'assistant', text: MOCK_REPLY },
    ]);
    setIsSending(false);
  }, [draft, isSending]);

  return {
    closeMenu,
    conversations,
    currentConversationId,
    draft,
    isLoadingConversations,
    isMenuOpen,
    isSending,
    loadConversations,
    messages,
    openMenu,
    profileName: welcomeName,
    selectConversation,
    sendMessage,
    setDraft,
    setIsMenuOpen,
    startNewConversation,
  };
}
