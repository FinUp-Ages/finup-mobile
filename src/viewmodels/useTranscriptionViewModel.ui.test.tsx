/// <reference types="jest" />
import { act, renderHook } from '@testing-library/react-native';
import { useTranscriptionViewModel } from './useTranscriptionViewModel';

const mockStart = jest.fn(), mockStop = jest.fn();
jest.mock('@/models/speechRecognitionModel', () => ({ ON_DEVICE_SERVICE_PACKAGE: 'test', SPEECH_LOCALE: 'pt-BR' }));
jest.mock('@/viewmodels/useSpeechCaptureViewModel', () => ({ useSpeechCaptureViewModel: () => ({ isRecording: false, start: mockStart, stop: mockStop, support: null }) }));

test('navega no roteiro com limites e alterna modo avião', async () => {
  const { result } = await renderHook(() => useTranscriptionViewModel());
  await act(async () => result.current.goTo(-1));
  expect(result.current.currentIndex).toBe(0);
  await act(async () => result.current.goTo(999));
  expect(result.current.currentIndex).toBe(result.current.phrases.length - 1);
  await act(async () => result.current.toggleAirplaneMode());
  expect(result.current.airplaneMode).toBe(true);
  await act(async () => result.current.clearResults());
  expect(result.current.currentIndex).toBe(0);
});

test('inicia captura e muda para modo livre', async () => {
  const { result } = await renderHook(() => useTranscriptionViewModel());
  await act(async () => result.current.setMode('livre'));
  await act(async () => result.current.toggleRecording());
  expect(result.current.mode).toBe('livre');
  expect(mockStart).toHaveBeenCalled();
});
