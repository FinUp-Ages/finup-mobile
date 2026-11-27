/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { AuthButton } from './AuthButton';
test('aciona botão e bloqueia enquanto carrega', async () => {
  const onPress = jest.fn();
  const screen = await render(<AuthButton title="Entrar" onPress={onPress} />);
  await fireEvent.press(screen.getByLabelText('Entrar'));
  expect(onPress).toHaveBeenCalledTimes(1);
  await screen.rerender(<AuthButton title="Entrar" onPress={onPress} loading variant="link" />);
  await fireEvent.press(screen.getByLabelText('Entrar'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
