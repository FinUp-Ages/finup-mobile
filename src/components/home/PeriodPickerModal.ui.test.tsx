/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { PeriodPickerModal } from './PeriodPickerModal';

test('PeriodPickerModal marca a seleção e devolve a opção escolhida', async () => {
  const onClose = jest.fn();
  const onSelect = jest.fn();
  const { getByText } = await render(
    <PeriodPickerModal
      onClose={onClose}
      onSelect={onSelect}
      options={[
        { key: '7d', label: 'Últimos 7 dias' },
        { key: '30d', label: 'Últimos 30 dias' },
      ]}
      selected="7d"
      visible
    />,
  );
  await fireEvent.press(getByText('Últimos 30 dias'));
  expect(onSelect).toHaveBeenCalledWith('30d');
  expect(onClose).toHaveBeenCalledTimes(1);
});
