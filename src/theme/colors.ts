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
  // Fundo do "Em breve" e superficies translucidas sobre o marinho.
  brandDeep: '#031836',
  glass: 'rgba(255, 255, 255, 0.12)',
  glassStrong: 'rgba(255, 255, 255, 0.2)',
  pillLight: '#f4f4f5',
  // Figma (tela Transacao): botao Saida em azul-gelo translucido; texto marinho.
  pillSoftFill: 'rgba(205, 233, 246, 0.1)',
  pillSoftText: '#cde9f6',
  // Marinho do Figma: fundo da aba Transacao e texto/icone sobre superficie clara.
  navy: '#021736',
  // Brilho azul do topo da aba Transacao (BrandGradient).
  brandGlow: '#1C93D7',
  // Superficie clara do Figma: botao Entrada e campo de valor do modal.
  surfaceLight: '#f5f5f5',
  // Cartoes, pilulas e campos translucidos sobre fundo escuro (Figma: branco 10%).
  glassSoft: 'rgba(255, 255, 255, 0.1)',
  // Placeholder sobre fundo escuro (Figma: branco 75%).
  placeholderOnDark: 'rgba(255, 255, 255, 0.75)',
  errorOnDark: '#fecaca',
  // Barra de abas (Figma): aba ativa em azul, indicador do Android translucido.
  tabActive: '#0088ff',
  tabIndicator: 'rgba(0, 136, 255, 0.16)',
  // Chatbot: degrade proprio (marinho no topo, azul claro embaixo), textos
  // azulados sobre ele e o menu lateral em marinho opaco.
  chatGradientTop: '#031833',
  chatGradientMiddle: '#031d3f',
  chatGradientLow: '#084a79',
  chatGradientBottom: '#1185bd',
  chatText: '#c6d8e6',
  chatTextBright: '#e8f3fb',
  chatTextMuted: '#7794af',
  chatAccent: '#8fc9f0',
  chatSuccess: '#84d7b5',
  chatUserText: '#0f2849',
  // Erro dentro do balao claro do usuario: o `error` nao tem contraste ali.
  chatErrorOnLight: '#b34747',
  chatPill: 'rgba(26, 61, 101, 0.7)',
  chatSendButton: 'rgba(135, 190, 226, 0.45)',
  chatDrawer: '#082544',
  chatDrawerItem: '#103456',
  chatOverlay: 'rgba(0, 12, 28, 0.65)',
} as const;

/**
 * Paleta escura da Home (aba Carteira): fundo, cartoes e textos sobre o marinho,
 * mais as cores proprias do card de saldo e do banner do score (Figma).
 */
export const darkColors = {
  background: '#04102A',
  surface: '#0B1E3D',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.65)',
  // Textos e icones sobre o card de saldo, do mais apagado ao mais forte.
  textCaption: 'rgba(255, 255, 255, 0.55)',
  textLabel: 'rgba(255, 255, 255, 0.6)',
  textBadge: 'rgba(255, 255, 255, 0.7)',
  iconOnCard: 'rgba(255, 255, 255, 0.8)',
  textHelper: 'rgba(255, 255, 255, 0.85)',
  // Figma: linear-gradient(128.92deg, #2343BD 0%, #3B82F6 100%) em 371x305.
  balanceCardGradient: ['#2343BD', '#3B82F6'] as const,
  incomeDot: '#00d492',
  incomeText: '#5ee9b5',
  expenseDot: '#ff637e',
  expenseText: '#ffa1ad',
  // Banner do score: degrade radial azul-claro -> azul profundo, botao translucido.
  scoreBannerLight: '#B3DCF2',
  scoreBannerDeep: '#005586',
  scoreBannerButton: 'rgba(2, 23, 54, 0.1)',
  // Seletor de periodo: fundo escurecido atras da lista e opcao pressionada.
  overlay: 'rgba(0, 0, 0, 0.55)',
  pressed: 'rgba(255, 255, 255, 0.08)',
} as const;