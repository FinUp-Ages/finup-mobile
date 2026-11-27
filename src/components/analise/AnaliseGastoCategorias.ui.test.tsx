/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { AnaliseGastoCategorias } from './AnaliseGastoCategorias';

jest.mock('expo-font', () => ({ ...jest.requireActual('expo-font'), isLoaded: () => true, loadAsync: jest.fn().mockResolvedValue(undefined) }));
const expenses = [{ id: 'a', name: 'Mercado', amount: 'R$ 40', percentage: 40 }, { id: 'b', name: 'Lazer', amount: 'R$ 30', percentage: 30 }, { id: 'c', name: 'Casa', amount: 'R$ 20', percentage: 20 }, { id: 'd', name: 'Saúde', amount: 'R$ 10', percentage: 10 }];

test('mostra estado vazio mesmo ao alternar gráfico', async () => {
  const screen = await render(<AnaliseGastoCategorias expenses={[]} total="R$ 0" />);
  expect(screen.getByText('Nenhum gasto no período selecionado.')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Gráfico em barra. Alterar'));
  expect(screen.getByText('Nenhum gasto no período selecionado.')).toBeTruthy();
});

test('expande categorias e alterna barras e pizza', async () => {
  const screen = await render(<AnaliseGastoCategorias expenses={expenses} total="R$ 100" />);
  expect(screen.queryByText('Saúde')).toBeNull();
  await fireEvent.press(screen.getByText('Ver mais'));
  expect(screen.getByText('Saúde')).toBeTruthy();
  await fireEvent.press(screen.getByText('Ver menos'));
  expect(screen.queryByText('Saúde')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Gráfico em barra. Alterar'));
  expect(screen.getByLabelText(/Gráfico em pizza\. Gasto total R\$ 100/)).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Gráfico em pizza. Alterar'));
  expect(screen.getByText('Gasto total')).toBeTruthy();
});
