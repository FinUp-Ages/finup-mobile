/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { CurrencyField } from './CurrencyField';
import { PasswordField } from './PasswordField';
import { TextField } from './TextField';

test('campos exibem erros, formatam moeda e comunicam alterações', async () => {
  const onAmountChange = jest.fn();
  const onTouch = jest.fn();
  const { getByLabelText, getByPlaceholderText, getByText, rerender } = await render(
    <CurrencyField
      error="Informe um valor"
      onChange={onAmountChange}
      onTouch={onTouch}
      value={12.5}
    />,
  );
  expect(getByLabelText('Valor').props.value).toBe('R$ 12,50');
  await fireEvent.changeText(getByLabelText('Valor'), 'R$ 1.234,56');
  await fireEvent(getByLabelText('Valor'), 'blur');
  expect(onAmountChange).toHaveBeenCalledWith(1234.56);
  expect(onTouch).toHaveBeenCalledTimes(1);
  expect(getByText('Informe um valor')).toBeTruthy();

  await rerender(<TextField error="E-mail inválido" placeholder="E-mail" value="x" />);
  expect(getByPlaceholderText('E-mail')).toBeTruthy();
  expect(getByText('E-mail inválido')).toBeTruthy();
});

test('PasswordField alterna visibilidade sem controlar o valor externo', async () => {
  const { getByDisplayValue, rerender } = await render(<PasswordField value="senha" />);
  expect(getByDisplayValue('senha').props.secureTextEntry).toBe(true);
  const pressable = getByDisplayValue('senha').parent;
  await fireEvent.press(pressable?.children[1] as never);
  expect(getByDisplayValue('senha').props.secureTextEntry).toBe(false);

  await rerender(<PasswordField showToggle={false} value="senha" />);
  expect(getByDisplayValue('senha').props.secureTextEntry).toBe(true);
});
