import { widgetLaunchModel } from '@/models/widgetLaunchModel';

/**
 * Links recebidos pelo sistema (Expo Router), antes de virarem rota.
 *
 * Link do widget com o app ja aberto: vai direto para o chat. Com o app fechado
 * (`initial`), o chat ainda nao pode abrir: a tela de carregamento confere a
 * sessao primeiro e depois consome a rota guardada (ver widgetLaunchModel).
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string {
  const route = widgetLaunchModel.routeFor(path);
  if (!route) return path;
  if (!initial) return route;

  widgetLaunchModel.setPending(route);
  return '/';
}
