/**
 * Paleta de cores do fluxo de cadastro - tom azul-marinho escuro (nao cinza
 * neutro puro), pra bater com o Figma. Centralizado aqui em vez de repetir hex
 * em cada componente: se o time confirmar valores exatos depois, e um lugar so
 * pra ajustar.
 */
export const colors = {
  background: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  placeholder: '#94a3b8',
  // Icones (calendario, olho) sao visivelmente mais escuros que o placeholder
  // no Figma - nao usam o mesmo tom claro do texto de exemplo dentro do campo.
  icon: '#334155',
  inputBackground: '#f1f5f9',
  track: '#e2e8f0',
  disabledIcon: '#cbd5e1',
  error: '#ef4444',
  link: '#2563eb',
  white: '#ffffff',
} as const;
