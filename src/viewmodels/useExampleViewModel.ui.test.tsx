/// <reference types="jest" />

import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/models/exampleModel', () => ({ exampleModel: { listAll: jest.fn() } }));

import { exampleModel } from '@/models/exampleModel';
import { useExampleViewModel } from './useExampleViewModel';

test('useExampleViewModel carrega dados e permite retry após erro', async () => {
  const mockListAll = jest.mocked(exampleModel.listAll);
  mockListAll
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce([{ id: '1', name: 'Exemplo', description: 'ok' }]);
  const { result } = await renderHook(() => useExampleViewModel());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toMatch(/Nao foi possivel/);

  await act(async () => result.current.reload());
  expect(result.current.examples).toEqual([{ id: '1', name: 'Exemplo', description: 'ok' }]);
  expect(result.current.error).toBeNull();
});
