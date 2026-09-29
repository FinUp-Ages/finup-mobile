/**
 * Constantes com as chaves de armazenamento.
 * Evita string solta e colisao de chave entre features.
 *
 * O SecureStore so aceita letras, numeros, ".", "-" e "_" na chave.
 */
export const storageKeys = {
  // Unico token que vai para o back (Authorization: Bearer). O IdToken nao e
  // guardado: o back recusa com 401 (token_use=id).
  accessToken: 'finup.auth.accessToken',
  // Renova o access token na abertura do app e e revogado no logout.
  refreshToken: 'finup.auth.refreshToken',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
