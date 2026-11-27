/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { TypeFilterPills } from './TypeFilterPills';

describe('TypeFilterPills', () => {
  it('mostra a seleção atual e envia a chave do filtro pressionado', async () => {
    const onSelect = jest.fn();
    const { getByLabelText } = await render(
      <TypeFilterPills onSelect={onSelect} selected="INCOME" />,
    );

    expect(getByLabelText('Filtrar por Entrada').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByLabelText('Filtrar por Saída').props.accessibilityState).toEqual({
      selected: false,
    });

    fireEvent.press(getByLabelText('Filtrar por Saída'));
    expect(onSelect).toHaveBeenCalledWith('EXPENSE');
  });
});
