import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTranscriptionReport, formatMs } from './transcriptionReport';

test('relatorio deixa explícitos frase pendente, suporte ausente e métricas nulas', () => {
  assert.equal(formatMs(null), '—');
  assert.equal(formatMs(999.6), '1000 ms');
  assert.equal(formatMs(1200), '1.20 s');

  const report = buildTranscriptionReport({
    phrases: [
      { id: 'one', expected: 'pagar conta' },
      { id: 'two', expected: 'ver saldo' },
    ],
    results: [
      {
        phraseId: 'one',
        expected: 'pagar conta',
        transcript: '',
        wordErrorRate: null,
        verdict: null,
        onDevice: true,
        finishedAt: 0,
        metrics: {
          firstPartialMs: null,
          finalizeMs: 500,
          totalMs: null,
          speechMs: null,
          partialCount: 0,
        },
      },
    ],
    support: null,
    locale: 'pt-BR',
    platform: 'android 14',
    generatedAt: 0,
    airplaneMode: true,
  });

  assert.match(report, /\| pagar conta \| _\(vazio\)_ \| — \| — \| 500 ms \| — \|/);
  assert.match(report, /\| ver saldo \| _não executada_ \| — \| — \| — \| — \|/);
  assert.match(report, /Frases executadas: 1 de 2/);
  assert.match(report, /Modo avião durante o teste:\*\* sim/);
  assert.match(report, /Reconhecimento no aparelho:\*\* não suportado/);
});
