/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { AnaliseCategoriaDonut } from './AnaliseCategoriaDonut';

const expenses = [{ id: 'a', name: 'Mercado', amount: 'R$ 60', percentage: 60 }, { id: 'b', name: 'Lazer', amount: 'R$ 40', percentage: 40 }];

test('seleciona fatia pelo toque e desmarca ao tocar novamente ou no centro', async () => {
  const onSelect = jest.fn();
  const props = { colors: ['red', 'blue'], expenses, onSelect, selectedId: null, total: 'R$ 100' };
  const screen = await render(<AnaliseCategoriaDonut {...props} />);
  expect(screen.getByLabelText(/Gráfico em pizza\. Gasto total R\$ 100/)).toBeTruthy();
  const ring = screen.getByLabelText(/Gráfico em pizza/).children[1];
  if (!ring || typeof ring === 'string') throw new Error('Área de toque do gráfico não encontrada');
  await fireEvent(ring, 'press', { nativeEvent: { locationX: 132, locationY: 9 } });
  expect(onSelect).toHaveBeenLastCalledWith('a');
  await screen.rerender(<AnaliseCategoriaDonut {...props} selectedId="a" />);
  const selectedRing = screen.getByLabelText(/Gráfico em pizza/).children[1];
  if (!selectedRing || typeof selectedRing === 'string') throw new Error('Área de toque do gráfico não encontrada');
  await fireEvent(selectedRing, 'press', { nativeEvent: { locationX: 132, locationY: 9 } });
  expect(onSelect).toHaveBeenLastCalledWith(null);
  await fireEvent(selectedRing, 'press', { nativeEvent: { locationX: 131, locationY: 131 } });
  expect(onSelect).toHaveBeenLastCalledWith(null);
});

test('toque fora do gráfico não altera seleção', async () => {
  const onSelect = jest.fn();
  const screen = await render(<AnaliseCategoriaDonut colors={['red', 'blue']} expenses={expenses} selectedId={null} total="R$ 100" onSelect={onSelect} />);
  const ring = screen.getByLabelText(/Gráfico em pizza/).children[1];
  if (!ring || typeof ring === 'string') throw new Error('Área de toque do gráfico não encontrada');
  await fireEvent(ring, 'press', { nativeEvent: { locationX: 0, locationY: 0 } });
  expect(onSelect).not.toHaveBeenCalled();
});
