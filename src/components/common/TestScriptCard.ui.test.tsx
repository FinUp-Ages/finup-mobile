/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import type { TestPhrase } from '@/types/speech';
import { TestScriptCard } from './TestScriptCard';

test('exibe frase pendente e navega respeitando limites', async () => {
  const first = { expected: 'Comprei pão' } as TestPhrase;
  const second = { expected: 'Paguei conta' } as TestPhrase;
  const onPrevious = jest.fn(), onNext = jest.fn();
  const screen = await render(<TestScriptCard phrases={[first, second]} currentIndex={0} currentPhrase={first} currentResult={null} disabled={false} onPrevious={onPrevious} onNext={onNext} onVerdict={jest.fn()} />);
  expect(screen.getByText('Comprei pão')).toBeTruthy();
  expect(screen.getByText(/Ainda sem resultado/)).toBeTruthy();
  await fireEvent.press(screen.getByText('anterior'));
  await fireEvent.press(screen.getByText('próxima'));
  expect(onPrevious).not.toHaveBeenCalled();
  expect(onNext).toHaveBeenCalledTimes(1);
});
