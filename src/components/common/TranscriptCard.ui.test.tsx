/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { TranscriptCard } from './TranscriptCard';

test('TranscriptCard mostra hipótese, resultado e métricas finais', async () => {
  const onClear = jest.fn();
  const { getByText, rerender } = await render(
    <TranscriptCard onClear={onClear} partial="olá" result={null} status="listening" />,
  );
  expect(getByText('olá')).toBeTruthy();
  await fireEvent.press(getByText('limpar'));
  expect(onClear).toHaveBeenCalledTimes(1);
  await rerender(
    <TranscriptCard
      onClear={onClear}
      partial=""
      status="idle"
      result={{
        text: 'texto final',
        onDevice: true,
        finishedAt: 0,
        metrics: { firstPartialMs: 10, finalizeMs: 20, totalMs: 30, speechMs: 15, partialCount: 2 },
      }}
    />,
  );
  expect(getByText('texto final')).toBeTruthy();
  expect(getByText('no aparelho')).toBeTruthy();
});
