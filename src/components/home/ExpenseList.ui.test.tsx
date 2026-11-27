/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { ExpenseList } from './ExpenseList';

describe('ExpenseList', () => {
  const common = { onPressIntegrate: jest.fn(), onPressViewMore: jest.fn() };

  it('representa carregamento, erro e estado vazio com CTA', async () => {
    const { getByLabelText, rerender, getByText } = await render(
      <ExpenseList {...common} expenses={[]} status="loading" />,
    );
    expect(getByLabelText('Carregando gastos')).toBeTruthy();

    await rerender(<ExpenseList {...common} expenses={[]} status="error" />);
    expect(getByText('Não foi possível carregar seus gastos.')).toBeTruthy();

    await rerender(<ExpenseList {...common} expenses={[]} status="success" />);
    await fireEvent.press(getByText('Integrar cartões'));
    expect(common.onPressIntegrate).toHaveBeenCalledTimes(1);
  });

  it('mostra gastos e abre a lista completa', async () => {
    const onPressViewMore = jest.fn();
    const { getByLabelText } = await render(
      <ExpenseList
        expenses={[
          {
            id: '1',
            title: 'Mercado',
            categoryName: 'Alimentação',
            date: 'Hoje',
            amount: '- R$ 25,00',
            type: 'EXPENSE',
          },
        ]}
        onPressIntegrate={jest.fn()}
        onPressViewMore={onPressViewMore}
        status="success"
      />,
    );
    expect(getByLabelText('Mercado, - R$ 25,00, Hoje')).toBeTruthy();
    await fireEvent.press(getByLabelText('Ver todas as transações'));
    expect(onPressViewMore).toHaveBeenCalledTimes(1);
  });
});
