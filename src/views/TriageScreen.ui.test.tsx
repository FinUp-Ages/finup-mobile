/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ useFocusEffect: () => {} }));
jest.mock('@/viewmodels/useTriageViewModel', () => ({ useTriageViewModel: jest.fn() }));

import { useTriageViewModel } from '@/viewmodels/useTriageViewModel';
import TriageScreen from './TriageScreen';

test('TriageScreen exibe falha e permite tentar carregar novamente', async () => {
  const load = jest.fn();
  jest
    .mocked(useTriageViewModel)
    .mockReturnValue({ status: 'error', close: jest.fn(), load } as never);
  const { getByText } = await render(<TriageScreen />);
  expect(getByText('Não foi possível carregar a triagem')).toBeTruthy();
  await fireEvent.press(getByText('Tentar novamente'));
  expect(load).toHaveBeenCalledTimes(1);
});
