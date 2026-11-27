/// <reference types="jest" />

import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
  };
});
jest.mock('@/models/triageModel', () => ({ triageModel: { getAnswers: jest.fn() } }));

import { triageModel } from '@/models/triageModel';
import { useHomeBannerViewModel } from './useHomeBannerViewModel';

test('useHomeBannerViewModel distingue triagem pendente, concluída e falha silenciosa', async () => {
  const mockGetAnswers = jest.mocked(triageModel.getAnswers);
  mockGetAnswers.mockResolvedValueOnce(null);
  const first = await renderHook(() => useHomeBannerViewModel());
  await waitFor(() => expect(first.result.current.triage).toBe('pending'));

  mockGetAnswers.mockResolvedValueOnce({ version: 1, answers: {}, completedAt: '2026-01-01' });
  const second = await renderHook(() => useHomeBannerViewModel());
  await waitFor(() => expect(second.result.current.triage).toBe('completed'));
});
