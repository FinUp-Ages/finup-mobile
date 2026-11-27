/// <reference types="jest" />

import { act, renderHook } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useAuthInitialViewModel } from './useAuthInitialViewModel';

describe('useAuthInitialViewModel', () => {
  it('navega para cadastro e login sem criar sessão falsa', async () => {
    const { result } = await renderHook(() => useAuthInitialViewModel());

    await act(async () => result.current.handleCreateAccount());
    await act(async () => result.current.handleAlreadyCustomer());

    expect(mockPush).toHaveBeenNthCalledWith(1, '/(auth)/cadastro');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/(auth)/login');
    expect(result.current.isAnyLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('encerra o estado de carregamento dos provedores preparados', async () => {
    const { result } = await renderHook(() => useAuthInitialViewModel());

    await act(async () => result.current.handleGoogleAuth());
    await act(async () => result.current.handleAppleAuth());

    expect(result.current.isLoadingGoogle).toBe(false);
    expect(result.current.isLoadingApple).toBe(false);
    expect(result.current.isAnyLoading).toBe(false);
  });
});
