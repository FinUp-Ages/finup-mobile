/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RegisterPlaceholderScreen from './RegisterPlaceholderScreen';
const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));
test('apresenta cadastro e permite voltar', async () => {
  const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><RegisterPlaceholderScreen /></SafeAreaProvider>);
  expect(screen.getByText('Crie sua conta')).toBeTruthy();
  await fireEvent.press(screen.getByText('← Voltar'));
  expect(mockBack).toHaveBeenCalledTimes(1);
});
