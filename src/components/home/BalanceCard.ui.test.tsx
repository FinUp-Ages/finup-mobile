/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { BalanceCard } from './BalanceCard';

const base = {
  balance: 'R$ 1.250,00',
  expense: '- R$ 250,00',
  income: '+ R$ 1.500,00',
  onPressAdd: jest.fn(),
  onRetry: jest.fn(),
  onSelectPeriod: jest.fn(),
  period: 'Últimos 7 dias',
  periodKey: '7d' as const,
};

describe('BalanceCard', () => {
  it('exibe carregamento e oferece retry no erro', async () => {
    const { getByLabelText, getByText, rerender } = await render(
      <BalanceCard {...base} status="loading" />,
    );
    expect(getByLabelText('Carregando saldo')).toBeTruthy();

    await rerender(<BalanceCard {...base} status="error" />);
    expect(getByText('Não foi possível carregar seu saldo.')).toBeTruthy();
    await fireEvent.press(getByText('Tentar novamente'));
    expect(base.onRetry).toHaveBeenCalledTimes(1);
  });

  it('mostra, oculta e restaura o saldo no sucesso', async () => {
    const { getByLabelText, getByText } = await render(<BalanceCard {...base} status="success" />);
    expect(getByText('R$ 1.250,00')).toBeTruthy();
    await fireEvent.press(getByLabelText('Ocultar saldo'));
    expect(getByText('R$ ••••••')).toBeTruthy();
    await fireEvent.press(getByLabelText('Mostrar saldo'));
    await fireEvent.press(getByText('Adicionar transação'));
    expect(base.onPressAdd).toHaveBeenCalledTimes(1);
  });
});
