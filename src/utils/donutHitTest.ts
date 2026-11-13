export type DonutHit =
  { kind: 'segment'; index: number } | { kind: 'center' } | { kind: 'outside' };

type DonutGeometry = {
  /** Lado do quadrado que contem o anel. */
  size: number;
  /** Espessura do anel. */
  stroke: number;
  /** Folga em volta do anel que ainda conta como toque (dedo e mais largo que o traco). */
  tolerance: number;
  /** Peso de cada fatia, na ordem em que sao desenhadas (a primeira comeca no topo, no sentido horario). */
  weights: number[];
};

/**
 * Descobre qual fatia do donut recebeu o toque a partir da posicao dele. O toque nativo do SVG usa o
 * circulo inteiro de cada fatia (ignora o tracejado), entao a ultima fatia desenhada engolia todos
 * os toques; aqui a fatia sai do angulo.
 *
 * - dentro do anel: `center` (o chamador volta ao total);
 * - sobre o anel: `segment` com o indice da fatia;
 * - fora do anel: `outside` (ignorar).
 */
export function hitTestDonut(x: number, y: number, geometry: DonutGeometry): DonutHit {
  const { size, stroke, tolerance, weights } = geometry;
  const dx = x - size / 2;
  const dy = y - size / 2;
  const distance = Math.hypot(dx, dy);
  const radius = (size - stroke) / 2;

  if (distance < radius - stroke / 2 - tolerance) return { kind: 'center' };
  if (distance > radius + stroke / 2 + tolerance) return { kind: 'outside' };

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return { kind: 'center' };

  // 0 graus no topo, crescendo no sentido horario.
  const degrees = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
  const fraction = degrees / 360;

  let accumulated = 0;
  for (let index = 0; index < weights.length; index += 1) {
    accumulated += weights[index] / total;
    if (fraction < accumulated) return { kind: 'segment', index };
  }
  return { kind: 'segment', index: weights.length - 1 };
}
