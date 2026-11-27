/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useTranscriptionViewModel } from '@/viewmodels/useTranscriptionViewModel';
import TranscriptionScreen from './TranscriptionScreen';

jest.mock('@/viewmodels/useTranscriptionViewModel', () => ({ useTranscriptionViewModel: jest.fn() }));

const makeVm = () => ({
  airplaneMode: false, clearResults: jest.fn(), currentIndex: 0,
  currentPhrase: { id: 'p1', expected: 'Comprei pão' }, currentResult: null,
  goTo: jest.fn(), locale: 'pt-BR', mode: 'roteiro', onDevicePackage: 'Serviço local',
  phrases: [{ id: 'p1', expected: 'Comprei pão' }, { id: 'p2', expected: 'Paguei conta' }],
  report: 'Relatório de teste', results: [], setMode: jest.fn(), setVerdict: jest.fn(),
  shareReport: jest.fn(), toggleAirplaneMode: jest.fn(), toggleRecording: jest.fn(),
  capture: { loadingSupport: true, support: null, downloadModel: jest.fn(), isRecording: false,
    status: 'idle', micLevel: new Animated.Value(0), error: null, notice: null,
    partial: '', result: null, reset: jest.fn() },
});

test('apresenta suporte em carregamento e encaminha navegação e gravação', async () => {
  const vm = makeVm();
  jest.mocked(useTranscriptionViewModel).mockReturnValue(vm as never);
  const screen = await render(<TranscriptionScreen />);
  expect(screen.getByText('Lendo as capacidades do aparelho...')).toBeTruthy();
  expect(screen.getByText('Comprei pão')).toBeTruthy();
  await fireEvent.press(screen.getByText('próxima'));
  await fireEvent.press(screen.getByLabelText('Iniciar gravação'));
  await fireEvent.press(screen.getByText('Fala livre'));
  expect(vm.goTo).toHaveBeenCalledWith(1);
  expect(vm.toggleRecording).toHaveBeenCalledTimes(1);
  expect(vm.setMode).toHaveBeenCalledWith('livre');
});

test('mostra suporte indisponível e bloqueia troca de modo durante gravação', async () => {
  const vm = makeVm();
  jest.mocked(useTranscriptionViewModel).mockReturnValue({ ...vm, capture: { ...vm.capture, loadingSupport: false, isRecording: true, status: 'listening', partial: 'Texto parcial', error: 'Permissão negada' } } as never);
  const screen = await render(<TranscriptionScreen />);
  expect(screen.getByText(/Não foi possível ler as capacidades do aparelho/)).toBeTruthy();
  expect(screen.getByText('Texto parcial')).toBeTruthy();
  expect(screen.getByText('Permissão negada')).toBeTruthy();
  await fireEvent.press(screen.getByText('Fala livre'));
  expect(vm.setMode).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByLabelText('Parar gravação'));
  expect(vm.toggleRecording).toHaveBeenCalledTimes(1);
});

test('mostra resultado e encaminha ações do relatório', async () => {
  const vm = makeVm();
  const metrics = { firstPartialMs: 100, finalizeMs: 200, totalMs: 500, speechMs: 300, partialCount: 1 };
  const result = { text: 'Comprei pão', metrics, onDevice: true, finishedAt: 1 };
  const phraseResult = { phraseId: 'p1', expected: 'Comprei pão', transcript: 'Comprei pão', metrics, onDevice: true, finishedAt: 1, verdict: null, wordErrorRate: 0 };
  jest.mocked(useTranscriptionViewModel).mockReturnValue({ ...vm, currentResult: phraseResult, results: [phraseResult], capture: { ...vm.capture, loadingSupport: false, result } } as never);
  const screen = await render(<TranscriptionScreen />);
  expect(screen.getByText('Relatório · 1 de 2')).toBeTruthy();
  expect(screen.getByText('Relatório de teste')).toBeTruthy();
  await fireEvent.press(screen.getByText('OK'));
  await fireEvent.press(screen.getByText('Compartilhar relatório'));
  await fireEvent.press(screen.getByText('Testei com o aparelho em modo avião'));
  await fireEvent.press(screen.getByText('zerar'));
  expect(vm.setVerdict).toHaveBeenCalledWith('p1', 'ok');
  expect(vm.shareReport).toHaveBeenCalledTimes(1);
  expect(vm.toggleAirplaneMode).toHaveBeenCalledTimes(1);
  expect(vm.clearResults).toHaveBeenCalledTimes(1);
});
