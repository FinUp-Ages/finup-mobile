/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { AnaliseMovimentacoes } from './AnaliseMovimentacoes';

test('exibe período vazio e abre listagem completa', async () => {
  const onPressViewMore = jest.fn();
  const screen = await render(<AnaliseMovimentacoes movements={[]} periodKey={'30D' as never} periodLabel="30 dias" sortOrder="NEWEST" onPressViewMore={onPressViewMore} onSelectPeriod={jest.fn()} onSelectSortOrder={jest.fn()} />);
  expect(screen.getByText('Sem transações no período')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Ver todas as transações'));
  expect(onPressViewMore).toHaveBeenCalledTimes(1);
});
