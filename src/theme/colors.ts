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
  textDark: '#1e293b',
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
  screenBackground: '#051329',
  // Tela Analise e modal de transacao (mockup): degrade azul para o marinho da
  // tela inicial, cartao e pilulas translucidos sobre ele.
  brandBlue: '#1a6fb0',
  brandDeep: '#031836',
  glass: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassStrong: 'rgba(255, 255, 255, 0.2)',
  pillLight: '#f4f4f5',
  pillDark: '#22385f',
  // Contorno do botao escuro: sem ele o botao some no fundo marinho.
  pillDarkBorder: 'rgba(255, 255, 255, 0.35)',
  errorOnDark: '#fecaca',
  // Barra de abas (Figma): aba ativa em azul, indicador do Android translucido.
  tabActive: '#0088ff',
  tabIndicator: 'rgba(0, 136, 255, 0.16)',
} as const;
