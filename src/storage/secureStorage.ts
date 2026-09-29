import * as SecureStore from 'expo-secure-store';
import type { StorageKey } from './storageKeys';

/**
 * Wrapper sobre expo-secure-store (Keychain no iOS, Keystore no Android).
 *
 * E AQUI que o token de autenticacao deve ser guardado.
 * Nunca use AsyncStorage para credenciais: ele nao e criptografado.
 * A senha nunca passa por aqui: ela so vive no estado do ViewModel.
 */
export const secureStorage = {
  getItem: (key: StorageKey) => SecureStore.getItemAsync(key),

  setItem: (key: StorageKey, value: string) => SecureStore.setItemAsync(key, value),

  deleteItem: (key: StorageKey) => SecureStore.deleteItemAsync(key),
};
