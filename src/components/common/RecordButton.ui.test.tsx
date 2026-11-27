/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { RecordButton } from './RecordButton';

test('RecordButton troca semântica entre iniciar/parar e respeita disabled', async () => {
  const onPress = jest.fn();
  const { getByLabelText, getByText, rerender } = await render(
    <RecordButton hint="Pronto para gravar" isRecording={false} onPress={onPress} />,
  );
  expect(getByText('Pronto para gravar')).toBeTruthy();
  await fireEvent.press(getByLabelText('Iniciar gravação'));
  expect(onPress).toHaveBeenCalledTimes(1);

  await rerender(<RecordButton isRecording onPress={onPress} />);
  expect(getByLabelText('Parar gravação').props.accessibilityState).toEqual({
    busy: true,
    disabled: false,
  });

  await rerender(<RecordButton disabled isRecording={false} onPress={onPress} />);
  await fireEvent.press(getByLabelText('Iniciar gravação'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
