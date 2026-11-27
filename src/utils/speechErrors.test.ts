import assert from 'node:assert/strict';
import test from 'node:test';
import { describeSpeechError, FATAL_SPEECH_ERRORS } from './speechErrors';

test('traduz erros conhecidos e preserva fallback para erros novos', () => {
  assert.equal(
    describeSpeechError('not-allowed'),
    'Permissão de microfone negada. Libere o microfone nas configurações do aparelho.',
  );
  assert.equal(describeSpeechError('unknown-code', 'Falha do fabricante.'), 'Falha do fabricante.');
  assert.equal(describeSpeechError('unknown-code'), 'Falha no reconhecimento (unknown-code).');
});

test('separa erros fatais de erros em que tentar novamente pode funcionar', () => {
  assert.equal(FATAL_SPEECH_ERRORS.has('audio-capture'), true);
  assert.equal(FATAL_SPEECH_ERRORS.has('network'), false);
});
