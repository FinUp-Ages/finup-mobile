import { useCallback, useEffect, useState } from 'react';
import type { ChatMessage } from '@/types/chatbot';
import { userModel } from '@/models/userModel';
const MOCK_REPLY = `Podemos organizar tranquilamente! Para juntar R$ 20.000 em 6 meses, o primeiro passo e transformar a meta em valores menores:\n\n• 🎯 Meta total: R$ 20.000\n• 📆 6 meses\n• 💵 Por mes: R$ 3.333\n• 💰 Por semana: R$ 769\n• 🔎 Por dia: R$ 110\n\nMas eu nao faria simplesmente “guardar R$ 3.333 por mes”. Da para organizar melhor, principalmente se tua renda nao for igual todos os meses.`;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * VIEWMODEL - estado local da demonstracao do chatbot.
 *
 * A resposta e intencionalmente simulada. A integracao com Bedrock entrara em
 * uma camada Model numa tarefa futura, sem levar HTTP para a View.
 */
export function useChatbotViewModel() {
  const [draft, setDraft] = useState('');
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
        // A saudacao continua generica se o perfil nao puder ser carregado.
        if (active) setWelcomeName(null);
      }
    }

    void loadWelcomeName();
    return () => {
      active = false;
    };
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
    draft,
    isMenuOpen,
    isSending,
    messages,
    profileName: welcomeName,
    sendMessage,
    setDraft,
    setIsMenuOpen,
  };
}
