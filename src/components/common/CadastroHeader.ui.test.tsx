/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { CadastroHeader } from './CadastroHeader';

test('CadastroHeader mostra título e permite voltar quando a etapa permite', async () => {
  const onBack = jest.fn();
  const { getByText, rerender, queryByText } = await render(
    <CadastroHeader onBack={onBack} onClose={jest.fn()} title="Seus dados" />,
  );
  expect(getByText('Seus dados')).toBeTruthy();
  await fireEvent.press(getByText('Voltar'));
  expect(onBack).toHaveBeenCalledTimes(1);

  await rerender(<CadastroHeader onClose={jest.fn()} title="Comece aqui" />);
  expect(queryByText('Voltar')).toBeNull();
});
