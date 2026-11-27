/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useChatbotViewModel } from '@/viewmodels/useChatbotViewModel';
import ChatbotScreen from './ChatbotScreen';

jest.mock('expo-font', () => ({ ...jest.requireActual('expo-font'), isLoaded: () => true, loadAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('react-native-screens/experimental', () => ({ SafeAreaView: require('react-native').View }));
jest.mock('@/components/chatbot/ChatbotMark', () => ({ ChatbotMark: () => null }));
jest.mock('@/viewmodels/useChatbotViewModel', () => ({ useChatbotViewModel: jest.fn() }));
jest.mock('@ronradtke/react-native-markdown-display', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { __esModule: true, default: ({ children }: { children: React.ReactNode }) => React.createElement(Text, null, children), MarkdownIt: () => ({ disable: () => ({}) }) };
});

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
const makeVm = () => ({
  conversationId: null, conversations: [], conversationsError: null, draft: '', errorMessage: null,
  hasConversation: false, inputFocusRequest: 0, isLoadingConversations: false,
  isLoadingMessages: false, isMenuOpen: false, isSending: false, messages: [], messagesError: null,
  profileName: 'Ana', loadConversations: jest.fn(), newConversation: jest.fn(), openConversation: jest.fn(),
  retryLastMessage: jest.fn(), retryOpenConversation: jest.fn(), sendMessage: jest.fn(),
  setDraft: jest.fn(), setIsMenuOpen: jest.fn(),
  voice: { cancel: jest.fn(), start: jest.fn(), stop: jest.fn(), isDisabled: false, handsFree: false, message: null, recordingStartedAt: null, status: 'idle' },
});

test('apresenta boas-vindas, abre menu e encaminha mensagem', async () => {
  const vm = { ...makeVm(), draft: 'Olá' };
  jest.mocked(useChatbotViewModel).mockReturnValue(vm as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><ChatbotScreen /></SafeAreaProvider>);
  expect(screen.getByText('Olá, Ana!')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Abrir menu'));
  await fireEvent.changeText(screen.getByLabelText('Digite sua mensagem'), 'Outra mensagem');
  await fireEvent.press(screen.getByLabelText('Enviar mensagem'));
  expect(vm.setIsMenuOpen).toHaveBeenCalledWith(true);
  expect(vm.setDraft).toHaveBeenCalledWith('Outra mensagem');
  expect(vm.sendMessage).toHaveBeenCalledTimes(1);
});

test('apresenta carregamento e erro ao abrir conversa com nova tentativa', async () => {
  const vm = makeVm();
  jest.mocked(useChatbotViewModel).mockReturnValue({ ...vm, isLoadingMessages: true } as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><ChatbotScreen /></SafeAreaProvider>);
  expect(screen.getByLabelText('Carregando conversa')).toBeTruthy();
  jest.mocked(useChatbotViewModel).mockReturnValue({ ...vm, messagesError: 'Falha ao abrir conversa' } as never);
  await screen.rerender(<SafeAreaProvider initialMetrics={metrics}><ChatbotScreen /></SafeAreaProvider>);
  expect(screen.getByText('Falha ao abrir conversa')).toBeTruthy();
  await fireEvent.press(screen.getByText('Tentar novamente'));
  expect(vm.retryOpenConversation).toHaveBeenCalledTimes(1);
});

test('mostra erro de envio e permite reenviar', async () => {
  const vm = { ...makeVm(), hasConversation: true, messages: [{ id: '1', role: 'user', status: 'error', text: 'Olá' }], errorMessage: 'Sem conexão' };
  jest.mocked(useChatbotViewModel).mockReturnValue(vm as never);
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><ChatbotScreen /></SafeAreaProvider>);
  expect(screen.getByText('Olá')).toBeTruthy();
  expect(screen.getByText('Sem conexão')).toBeTruthy();
  await fireEvent.press(screen.getByText('Tentar novamente'));
  expect(vm.retryLastMessage).toHaveBeenCalledTimes(1);
});
