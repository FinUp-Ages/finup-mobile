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
  // Assinaturas dos alertas de gastos que a pessoa já dispensou neste aparelho.
  // Não contém credenciais e é temporário até a persistência estar inteiramente
  // coberta pelo backend.
  dismissedSpendingAlerts: 'finup.insights.dismissedSpendingAlerts',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
