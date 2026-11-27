/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/viewmodels/useExampleViewModel', () => ({ useExampleViewModel: jest.fn() }));

import { useExampleViewModel } from '@/viewmodels/useExampleViewModel';
import ExampleScreen from './ExampleScreen';

test('ExampleScreen mostra erro do ViewModel e permite recarregar', async () => {
  const mockReload = jest.fn();
  jest
    .mocked(useExampleViewModel)
    .mockReturnValue({
      examples: [],
      loading: false,
      error: 'Falha controlada',
      reload: mockReload,
    });
  const { getByText } = await render(<ExampleScreen />);
  expect(getByText('Falha controlada')).toBeTruthy();
  await fireEvent.press(getByText('Recarregar'));
  expect(mockReload).toHaveBeenCalledTimes(1);
});
