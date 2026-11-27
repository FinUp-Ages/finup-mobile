/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import type { SpendingAlert } from '@/types/spendingAlert';
import { SpendingAlertPopup } from './SpendingAlertPopup';

test('mostra mensagem, projeção e permite dispensar alerta', async () => {
  const onDismiss = jest.fn();
  const alert = { categoryName: 'Lazer', message: 'Gasto elevado', projection: { futureValue: 1000, years: 5, annualRatePct: 10 } } as SpendingAlert;
  const screen = await render(<SpendingAlertPopup alert={alert} visible onDismiss={onDismiss} />);
  expect(screen.getByText('Lazer')).toBeTruthy();
  expect(screen.getByText('Gasto elevado')).toBeTruthy();
  expect(screen.getByText(/em 5 anos, a 10% ao ano/)).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Entendi, dispensar alerta'));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});
