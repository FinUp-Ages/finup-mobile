/**
 * MODEL - aviso de que o saldo pode ter mudado fora da tela que o mostra.
 *
 * As abas ficam montadas ao mesmo tempo (NativeTabs): quando o chatbot registra
 * uma transacao, a aba Transacao nao fica sabendo sozinha. Quem altera dados
 * chama `notifyChanged`; quem mostra saldo assina com `subscribe` e recarrega.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export const transactionEvents = {
  notifyChanged(): void {
    listeners.forEach((listener) => listener());
  },
  /** Devolve a funcao que cancela a assinatura (para o cleanup do useEffect). */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
