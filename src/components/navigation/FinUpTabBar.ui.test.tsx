/// <reference types="jest" />
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { FinUpTabBar } from './FinUpTabBar';

test('emite evento de aba e navega somente quando permitido', async () => {
  const reduceMotion = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  const spring = jest.spyOn(Animated, 'spring').mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() } as never);
  try {
    const navigateToTab = jest.fn();
    const emit = jest.fn().mockReturnValue({ defaultPrevented: false });
    const props = { state: { index: 0, routes: [{ key: 'home', name: 'carteira' }, { key: 'analysis', name: 'analise' }] }, descriptors: { home: { options: { title: 'Carteira' } }, analysis: { options: { title: 'Análise' } } }, emitter: { emit }, navigateToTab, insets: { bottom: 0 } };
    const screen = await render(<FinUpTabBar {...(props as unknown as ComponentProps<typeof FinUpTabBar>)} />);
    await waitFor(() => expect(screen.getByLabelText('Análise')).toBeTruthy());
    await fireEvent.press(screen.getByLabelText('Análise'));
    expect(emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'analysis', canPreventDefault: true });
    expect(navigateToTab).toHaveBeenCalledWith('analysis');
    emit.mockReturnValue({ defaultPrevented: true });
    await fireEvent.press(screen.getByLabelText('Análise'));
    expect(navigateToTab).toHaveBeenCalledTimes(1);
    await screen.unmount();
  } finally {
    reduceMotion.mockRestore();
    spring.mockRestore();
  }
});
