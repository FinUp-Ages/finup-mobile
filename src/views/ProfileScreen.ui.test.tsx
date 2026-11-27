/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { useProfileViewModel } from '@/viewmodels/useProfileViewModel';
import ProfileScreen from './ProfileScreen';

jest.mock('@/viewmodels/useProfileViewModel', () => ({ useProfileViewModel: jest.fn() }));

test('mostra erro de perfil e oferece nova tentativa', async () => {
  const retry = jest.fn();
  jest.mocked(useProfileViewModel).mockReturnValue({ loading: false, loadError: true, retry, signingOut: false, signOut: jest.fn(), assessment: null, openTriage: jest.fn() });
  const screen = await render(<ProfileScreen />);
  expect(screen.getByText('Não foi possível consultar seu perfil.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Tentar novamente'));
  expect(retry).toHaveBeenCalledTimes(1);
});

test('permite iniciar perfil e sair', async () => {
  const openTriage = jest.fn(), signOut = jest.fn();
  jest.mocked(useProfileViewModel).mockReturnValue({ loading: false, loadError: false, retry: jest.fn(), signingOut: false, signOut, assessment: null, openTriage });
  const screen = await render(<ProfileScreen />);
  await fireEvent.press(screen.getByText('Fazer perfil de investidor'));
  await fireEvent.press(screen.getByText('Sair'));
  expect(openTriage).toHaveBeenCalledTimes(1);
  expect(signOut).toHaveBeenCalledTimes(1);
});
