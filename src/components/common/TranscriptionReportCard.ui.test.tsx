/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { TranscriptionReportCard } from './TranscriptionReportCard';

test('mostra relatório e encaminha ações', async () => {
  const onClear = jest.fn(), onShare = jest.fn(), onToggleAirplaneMode = jest.fn();
  const screen = await render(<TranscriptionReportCard report="Relatório de teste" executed={2} total={4} airplaneMode={false} onClear={onClear} onShare={onShare} onToggleAirplaneMode={onToggleAirplaneMode} />);
  expect(screen.getByText('Relatório · 2 de 4')).toBeTruthy();
  await fireEvent.press(screen.getByText('zerar'));
  await fireEvent.press(screen.getByText('Compartilhar relatório'));
  await fireEvent.press(screen.getByText('Testei com o aparelho em modo avião'));
  expect(onClear).toHaveBeenCalledTimes(1);
  expect(onShare).toHaveBeenCalledTimes(1);
  expect(onToggleAirplaneMode).toHaveBeenCalledTimes(1);
});
