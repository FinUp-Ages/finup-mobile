/// <reference types="jest" />

import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { MicLevelBar } from './MicLevelBar';

test('MicLevelBar aceita nível animado nos estados ativo e inativo', async () => {
  const level = new Animated.Value(0.5);
  const { toJSON, rerender } = await render(<MicLevelBar active level={level} />);
  expect(toJSON()).toBeTruthy();
  await rerender(<MicLevelBar active={false} level={level} />);
  expect(toJSON()).toBeTruthy();
});
