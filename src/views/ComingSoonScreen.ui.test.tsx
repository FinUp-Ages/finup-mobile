/// <reference types="jest" />

import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ComingSoonScreen from './ComingSoonScreen';

const initialMetrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 44 },
};

test('ComingSoonScreen anuncia a funcionalidade aguardada', async () => {
  const { getByText } = await render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ComingSoonScreen title="Carteira" />
    </SafeAreaProvider>,
  );

  expect(getByText('Carteira')).toBeTruthy();
  expect(getByText('Em breve.')).toBeTruthy();
});
