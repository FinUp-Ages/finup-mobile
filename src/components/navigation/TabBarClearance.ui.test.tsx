/// <reference types="jest" />
import { act, renderHook } from '@testing-library/react-native';
import { TabBarClearanceProvider, useReportTabBarHeight, useTabBarClearance } from './TabBarClearance';

test('compartilha a altura informada pela barra com as telas', async () => {
  const { result } = await renderHook(() => ({ height: useTabBarClearance(), report: useReportTabBarHeight() }), { wrapper: TabBarClearanceProvider });
  expect(result.current.height).toBe(0);
  await act(async () => result.current.report(82));
  expect(result.current.height).toBe(82);
  await act(async () => result.current.report(0));
  expect(result.current.height).toBe(0);
});
