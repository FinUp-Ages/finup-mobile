/// <reference types="jest" />
import { act, fireEvent, render } from '@testing-library/react-native';
import type { SpendingAlert } from '@/types/spendingAlert';
import { AnaliseAlerta } from './AnaliseAlerta';

test('expande e recolhe detalhes do alerta', async () => {
  jest.useFakeTimers();
  try {
    const alert = { categoryName: 'Lazer', riskKind: 'Frequência', message: 'Gasto elevado', projection: { futureValue: 1000, years: 5, annualRatePct: 10 } } as SpendingAlert;
    const screen = await render(<AnaliseAlerta alert={alert} />);
    await fireEvent.press(screen.getByLabelText(/^Atenção sobre Lazer\./));
    await act(async () => { jest.advanceTimersByTime(300); });
    expect(screen.getByLabelText(/Atenção sobre Lazer\. Gasto elevado/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(/Atenção sobre Lazer\. Gasto elevado/));
    await act(async () => { jest.advanceTimersByTime(300); });
    expect(screen.getByLabelText(/^Atenção sobre Lazer\./)).toBeTruthy();
    await screen.unmount();
  } finally {
    jest.useRealTimers();
  }
});
