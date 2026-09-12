/**
 * Adaptador de armazenamento para credenciais e sessao.
 *
 * Durante a fase de desenvolvimento com mocks de front-end, mantem os dados
 * de forma assincrona e segura com a mesma assinatura do Expo SecureStore.
 * Quando o time de backend plugar o modulo nativo, basta repassar para o SecureStore.
 */
const inMemoryStorage = new Map<string, string>();

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    return inMemoryStorage.get(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    inMemoryStorage.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    inMemoryStorage.delete(key);
  },
};
