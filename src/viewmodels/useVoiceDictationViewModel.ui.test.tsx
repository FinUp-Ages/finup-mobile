/// <reference types="jest" />
import { act, renderHook } from '@testing-library/react-native';
import { abortTranscription, isSpeechRecognitionAvailable, requestSpeechPermission, startTranscription, stopTranscription } from '@/models/speechRecognitionModel';
import { useVoiceDictationViewModel } from './useVoiceDictationViewModel';

const mockEvents: Record<string, (event?: any) => void> = {};
jest.mock('@/models/speechRecognitionModel', () => ({
  abortTranscription: jest.fn(), buildDictationOptions: () => ({}), isSpeechRecognitionAvailable: jest.fn(), normalizeVolume: (value: number) => value,
  requestSpeechPermission: jest.fn(), startTranscription: jest.fn(), stopTranscription: jest.fn(),
  useSpeechRecognitionEvent: (name: string, callback: (event?: any) => void) => { mockEvents[name] = callback; },
}));
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(isSpeechRecognitionAvailable).mockReturnValue(true);
  jest.mocked(requestSpeechPermission).mockResolvedValue(true);
});

test('nega permissão sem iniciar gravação', async () => {
  jest.mocked(requestSpeechPermission).mockResolvedValueOnce(false);
  const { result } = await renderHook(() => useVoiceDictationViewModel({ onRecorded: jest.fn() }));
  await act(async () => result.current.start());
  expect(result.current.message).toContain('Permita o acesso ao microfone');
  expect(startTranscription).not.toHaveBeenCalled();
});

test('entrega transcrição final após parada', async () => {
  const onRecorded = jest.fn();
  const { result } = await renderHook(() => useVoiceDictationViewModel({ onRecorded }));
  await act(async () => result.current.start());
  await act(async () => mockEvents.start());
  expect(result.current.status).toBe('recording');
  await act(async () => mockEvents.result({ isFinal: true, results: [{ transcript: '  Olá  ' }] }));
  await act(async () => result.current.stop());
  expect(stopTranscription).toHaveBeenCalledTimes(1);
  await act(async () => mockEvents.end());
  expect(onRecorded).toHaveBeenCalledWith('Olá', expect.objectContaining({ levels: expect.any(Array) }));
  expect(result.current.status).toBe('idle');
});

test('cancelamento descarta áudio sem enviar texto', async () => {
  const onRecorded = jest.fn();
  const { result } = await renderHook(() => useVoiceDictationViewModel({ onRecorded }));
  await act(async () => result.current.start());
  await act(async () => result.current.cancel());
  expect(abortTranscription).toHaveBeenCalledTimes(1);
  await act(async () => mockEvents.end());
  expect(onRecorded).not.toHaveBeenCalled();
});
