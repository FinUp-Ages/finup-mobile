import assert from 'node:assert/strict';
import test from 'node:test';
import { hitTestDonut } from './donutHitTest';

const geometry = { size: 262, stroke: 18, tolerance: 8, weights: [50, 30, 20] };
const center = geometry.size / 2;
const ringRadius = (geometry.size - geometry.stroke) / 2;

/** Ponto sobre o anel a `degrees` do topo, no sentido horario. */
function onRing(degrees: number): [number, number] {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [center + ringRadius * Math.cos(radians), center + ringRadius * Math.sin(radians)];
}

test('toque logo a direita do topo cai na primeira fatia', () => {
  assert.deepEqual(hitTestDonut(...onRing(10), geometry), { kind: 'segment', index: 0 });
});

test('toque embaixo cai na primeira fatia (ela cobre 0 a 180 graus)', () => {
  assert.deepEqual(hitTestDonut(...onRing(170), geometry), { kind: 'segment', index: 0 });
});

test('cada fatia responde na sua faixa de angulo, nao so a ultima', () => {
  assert.deepEqual(hitTestDonut(...onRing(230), geometry), { kind: 'segment', index: 1 });
  assert.deepEqual(hitTestDonut(...onRing(320), geometry), { kind: 'segment', index: 2 });
});

test('toque logo a esquerda do topo cai na ultima fatia', () => {
  assert.deepEqual(hitTestDonut(...onRing(355), geometry), { kind: 'segment', index: 2 });
});

test('toque no miolo volta ao total', () => {
  assert.deepEqual(hitTestDonut(center, center, geometry), { kind: 'center' });
});

test('toque fora do anel e ignorado', () => {
  assert.deepEqual(hitTestDonut(2, 2, geometry), { kind: 'outside' });
});

test('anel um pouco alem da borda ainda conta por causa da folga do dedo', () => {
  const [x, y] = onRing(90);
  assert.deepEqual(hitTestDonut(x + geometry.stroke / 2 + 5, y, geometry), {
    kind: 'segment',
    index: 0,
  });
});

test('sem peso nenhum, o toque no anel volta ao total', () => {
  assert.deepEqual(hitTestDonut(...onRing(10), { ...geometry, weights: [] }), { kind: 'center' });
});
