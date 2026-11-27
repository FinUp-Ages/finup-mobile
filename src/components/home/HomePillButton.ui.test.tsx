/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { HomePillButton } from '@/components/ui/HomePillButton';

test('HomePillButton encaminha a ação solicitada', async () => {
  const onPress = jest.fn();
  const { getByText } = await render(
    <HomePillButton icon="refresh-cw" label="Tentar novamente" onPress={onPress} />,
  );

  fireEvent.press(getByText('Tentar novamente'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
