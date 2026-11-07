import type { Href } from 'expo-router';

/**
 * MODEL - links abertos pelo widget da tela inicial (Android, ver src/widgets).
 *
 * O widget nao recebe digitacao: como a barra de pesquisa do Google, cada area
 * abre o app ja pronto para escrever (`finup://chatbot?modo=texto`) ou falar
 * (`finup://chatbot?modo=voz`).
 *
 * Com o app fechado, o link passa antes pela tela de carregamento (e pelo login,
 * sem sessao): a rota fica guardada aqui e quem decide a primeira tela a consome
 * no lugar da Home.
 */
export type ChatbotLaunchMode = 'texto' | 'voz';

export const WIDGET_LINKS: Record<ChatbotLaunchMode, string> = {
  texto: 'finup://chatbot?modo=texto',
  voz: 'finup://chatbot?modo=voz',
};

// Aceita o link inteiro (`finup://chatbot?...`) e o caminho ja sem o esquema.
const CHATBOT_LINK = /^(?:finup:\/\/\/?|\/)?chatbot\?(?:.*&)?modo=(texto|voz)(?:&|$)/;

let pendingRoute: Href | null = null;

export function isChatbotLaunchMode(value: unknown): value is ChatbotLaunchMode {
  return value === 'texto' || value === 'voz';
}

export const widgetLaunchModel = {
  /** Rota do chat para um link do widget, ou null se o link nao e do widget. */
  routeFor(path: string): string | null {
    const mode = CHATBOT_LINK.exec(path)?.[1];
    return isChatbotLaunchMode(mode) ? `/chatbot?modo=${mode}` : null;
  },
  /** Guarda a rota ate a sessao ser confirmada (tela de carregamento ou login). */
  setPending(route: Href): void {
    pendingRoute = route;
  },
  /** Devolve a rota guardada uma unica vez. */
  consumePending(): Href | null {
    const route = pendingRoute;
    pendingRoute = null;
    return route;
  },
  /** Esquece a rota guardada (a pessoa seguiu para o cadastro em vez do login). */
  discardPending(): void {
    pendingRoute = null;
  },
};
