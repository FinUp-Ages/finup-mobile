/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { PillButton } from './PillButton';
import { PrimaryButton } from './PrimaryButton';

test('PrimaryButton e PillButton respeitam estados interativos', async () => {
  const primary = jest.fn();
  const pill = jest.fn();
  const { getByText, rerender } = await render(
    <PrimaryButton icon="plus" label="Adicionar" onPress={primary} />,
  );
  await fireEvent.press(getByText('Adicionar'));
  expect(primary).toHaveBeenCalledTimes(1);

  await rerender(<PrimaryButton disabled label="Adicionar" onPress={primary} />);
  await fireEvent.press(getByText('Adicionar'));
  expect(primary).toHaveBeenCalledTimes(1);

  await rerender(<PillButton icon="minus" label="Salvar saída" onPress={pill} variant="dark" />);
  await fireEvent.press(getByText('Salvar saída'));
  expect(pill).toHaveBeenCalledTimes(1);
});
