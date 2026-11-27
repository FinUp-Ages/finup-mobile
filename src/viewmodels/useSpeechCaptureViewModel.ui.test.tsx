/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { isSpeechRecognitionAvailable, readDeviceSupport, requestSpeechPermission, startTranscription, stopTranscription } from '@/models/speechRecognitionModel';
import { useSpeechCaptureViewModel } from './useSpeechCaptureViewModel';

const mockEvents: Record<string, (event?: any) => void> = {};
jest.mock('@/models/speechRecognitionModel', () => ({
  abortTranscription: jest.fn(), buildRecognitionOptions: jest.fn(() => ({})), downloadOfflineModel: jest.fn(),
  isSpeechRecognitionAvailable: jest.fn(), readDeviceSupport: jest.fn(), requestSpeechPermission: jest.fn(),
  startTranscription: jest.fn(), stopTranscription: jest.fn(), VOLUME_RANGE: { min: -2, max: 10 },
  useSpeechRecognitionEvent: (name: string, callback: (event?: any) => void) => { mockEvents[name] = callback; },
}));
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(isSpeechRecognitionAvailable).mockReturnValue(true);
  jest.mocked(readDeviceSupport).mockResolvedValue({ recognitionAvailable: true, onDeviceSupported: true } as never);
  jest.mocked(requestSpeechPermission).mockResolvedValue(true);
});

test('nega permissão sem iniciar captura', async () => {
  jest.mocked(requestSpeechPermission).mockResolvedValueOnce(false);
  const { result } = await renderHook(() => useSpeechCaptureViewModel());
  await waitFor(() => expect(result.current.loadingSupport).toBe(false));
  await act(async () => result.current.start());
  expect(result.current.error).toContain('Permissão de microfone negada');
  expect(startTranscription).not.toHaveBeenCalled();
});

test('entrega resultado final uma vez e permite limpar', async () => {
  const onResult = jest.fn();
  const { result } = await renderHook(() => useSpeechCaptureViewModel({ onResult }));
  await waitFor(() => expect(result.current.loadingSupport).toBe(false));
  await act(async () => result.current.start());
  await act(async () => mockEvents.start());
  await act(async () => mockEvents.result({ isFinal: false, results: [{ transcript: 'Olá' }] }));
  expect(result.current.partial).toBe('Olá');
  await act(async () => mockEvents.result({ isFinal: true, results: [{ transcript: 'Olá mundo' }] }));
  await act(async () => mockEvents.result({ isFinal: true, results: [{ transcript: 'duplicado' }] }));
  expect(onResult).toHaveBeenCalledTimes(1);
  expect(result.current.result?.text).toBe('Olá mundo');
  await act(async () => result.current.stop());
  expect(stopTranscription).toHaveBeenCalledTimes(1);
  await act(async () => mockEvents.end());
  await act(async () => result.current.reset());
  expect(result.current.result).toBeNull();
});
