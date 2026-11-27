/// <reference types="jest" />
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { studyAnswersModel } from '@/models/studyAnswersModel';
import type { StudyQuestion } from '@/types/studyTrack';
import { useStudySessionViewModel } from '@/viewmodels/useStudySessionViewModel';
import { StudyQuestionModal } from './StudyQuestionModal';

jest.mock('expo-font', () => ({ ...jest.requireActual('expo-font'), isLoaded: () => true, loadAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/models/studyAnswersModel', () => ({ studyAnswersModel: { submitAnswers: jest.fn() } }));
jest.mock('@ronradtke/react-native-markdown-display', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { __esModule: true, default: ({ children }: { children: React.ReactNode }) => React.createElement(Text, null, children), MarkdownIt: () => ({ disable: () => ({}) }) };
});
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
const questions: StudyQuestion[] = [{ id: 'q1', published: { type: 'MULTIPLE_CHOICE', statement: 'Qual opção?', options: [{ text: 'Guardar', correct: true }, { text: 'Gastar', correct: false }], explanation: 'Ter reserva ajuda.' } }];
const response = { categoryId: 'cat', correctCount: 1, gradableCount: 1, stars: 3, answers: [] };
function Session({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const vm = useStudySessionViewModel({ categoryId: 'cat', questions, startQuestionId: 'q1', onSaved });
  return <StudyQuestionModal vm={vm} topic="Finanças" onClose={onClose} />;
}
beforeEach(() => jest.resetAllMocks());

test('seleciona, responde, mostra feedback e conclui rodada', async () => {
  jest.mocked(studyAnswersModel.submitAnswers).mockResolvedValue(response as never);
  const onClose = jest.fn(), onSaved = jest.fn();
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><Session onClose={onClose} onSaved={onSaved} /></SafeAreaProvider>);
  await fireEvent.press(screen.getByLabelText('A. Guardar'));
  await fireEvent.press(screen.getByText('Responder'));
  expect(screen.getByText('Você acertou!')).toBeTruthy();
  expect(screen.getByText('Resposta: A')).toBeTruthy();
  await fireEvent.press(screen.getByText('Próximo'));
  await waitFor(() => expect(screen.getByText('Rodada concluída!')).toBeTruthy());
  expect(onSaved).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByText('Voltar à trilha'));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('preserva respostas e oferece nova tentativa após falha de salvamento', async () => {
  jest.mocked(studyAnswersModel.submitAnswers).mockResolvedValueOnce(response as never).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response as never);
  const onSaved = jest.fn();
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><Session onClose={jest.fn()} onSaved={onSaved} /></SafeAreaProvider>);
  await fireEvent.press(screen.getByLabelText('A. Guardar'));
  await fireEvent.press(screen.getByText('Responder'));
  await fireEvent.press(screen.getByText('Próximo'));
  await waitFor(() => expect(screen.getByText('Não foi possível concluir')).toBeTruthy());
  await fireEvent.press(screen.getByText('Tentar salvar novamente'));
  await waitFor(() => expect(screen.getByText('Rodada concluída!')).toBeTruthy());
  expect(onSaved).toHaveBeenCalledTimes(1);
  expect(studyAnswersModel.submitAnswers).toHaveBeenCalledTimes(3);
});
