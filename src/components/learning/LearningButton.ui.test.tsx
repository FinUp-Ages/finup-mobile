/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { LearningButton } from './LearningButton';

test('LearningButton encaminha foco, blur e ação sem substituir callbacks', async () => {
  const onBlur = jest.fn();
  const onFocus = jest.fn();
  const onPress = jest.fn();
  const { getByLabelText } = await render(
    <LearningButton
      accessibilityLabel="Avançar trilha"
      onBlur={onBlur}
      onFocus={onFocus}
      onPress={onPress}
    />,
  );
  const button = getByLabelText('Avançar trilha');
  await fireEvent(button, 'focus');
  await fireEvent.press(button);
  await fireEvent(button, 'blur');
  expect(onFocus).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onBlur).toHaveBeenCalledTimes(1);
});
