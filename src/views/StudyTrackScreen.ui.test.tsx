/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStudyTrackViewModel } from '@/viewmodels/useStudyTrackViewModel';
import StudyTrackScreen from './StudyTrackScreen';

jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: jest.fn() }) }));
jest.mock('@/viewmodels/useStudyTrackViewModel', () => ({ useStudyTrackViewModel: jest.fn() }));
jest.mock('@/views/StudySessionScreen', () => ({ __esModule: true, default: () => null }));
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };

test('oferece nova tentativa quando cursos falham', async () => {
  const retry = jest.fn();
  jest.mocked(useStudyTrackViewModel).mockReturnValue({ status: 'error', retry, categories: [], topicOpen: false } as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><StudyTrackScreen /></SafeAreaProvider>);
  expect(screen.getByText('Não foi possível carregar os cursos.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Tentar novamente'));
  expect(retry).toHaveBeenCalledTimes(1);
});

test('abre nível alcançado e permite selecionar curso', async () => {
  const openLevel = jest.fn(), selectCategory = jest.fn();
  const level = { number: 1, stars: 0, reached: true, question: { id: 'q1' } };
  jest.mocked(useStudyTrackViewModel).mockReturnValue({ status: 'success', categories: [{ id: 'a', name: 'Finanças' }], categoryId: 'a', topic: 'Finanças', topicOpen: false, questionStatus: 'success', progress: 0, levels: [level], isDemo: false, progressUnavailable: false, openedLevel: null, openLevel, selectCategory, setTopicOpen: jest.fn() } as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><StudyTrackScreen /></SafeAreaProvider>);
  await fireEvent.press(screen.getByLabelText('Finanças'));
  await fireEvent.press(screen.getByLabelText('Nível 1, 0 de 3 estrelas'));
  expect(selectCategory).toHaveBeenCalledWith('a');
  expect(openLevel).toHaveBeenCalledWith(level);
});
