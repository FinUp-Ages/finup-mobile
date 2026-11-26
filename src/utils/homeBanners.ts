import type { HomeTriageStatus } from '../viewmodels/useHomeBannerViewModel';

export type HomeBannerKey = 'score' | 'learning';

/**
 * Banners da Home. Triagem pendente: score (leva a triagem) e aprendizado. Triagem respondida
 * sem FinUp Score (ex.: feita antes da pergunta da renda): o do score volta, porque a triagem
 * e onde o usuario informa a renda que o score exige. Com score, so o de aprendizado.
 *
 * `hasScore` null = ainda nao se sabe (Home carregando ou com erro): nao mostra o do score
 * por isso. Triagem desconhecida: so o do score, como antes.
 */
export function homeBannerKeys(
  triage: HomeTriageStatus,
  hasScore: boolean | null,
): HomeBannerKey[] {
  if (triage === 'unknown') return ['score'];
  if (triage === 'pending' || hasScore === false) return ['score', 'learning'];
  return ['learning'];
}
