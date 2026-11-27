/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { chatbotModel } from '@/models/chatbotModel';
import { userModel } from '@/models/userModel';
import { useChatbotViewModel } from './useChatbotViewModel';

jest.mock('expo-router', () => ({ useRouter: () => ({}), useLocalSearchParams: () => ({}) }));
jest.mock('@/models/chatbotModel', () => ({ chatbotModel: { listConversations: jest.fn(), listMessages: jest.fn(), sendMessage: jest.fn() } }));
jest.mock('@/models/userModel', () => ({ userModel: { getMe: jest.fn() } }));
jest.mock('@/models/authModel', () => ({ authModel: { hasSession: jest.fn() } }));
jest.mock('@/models/transactionEvents', () => ({ transactionEvents: { notifyChanged: jest.fn() } }));
jest.mock('@/viewmodels/useVoiceDictationViewModel', () => ({ useVoiceDictationViewModel: () => ({ isActive: false, start: jest.fn(), dismissMessage: jest.fn() }) }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(userModel.getMe).mockResolvedValue({ name: 'Ana Silva' } as never);
  jest.mocked(chatbotModel.listConversations).mockResolvedValue([]);
});

test('envia mensagem e mostra resposta da conversa', async () => {
  jest.mocked(chatbotModel.sendMessage).mockResolvedValue({ message: 'Anotado', conversationId: 'c1' } as never);
  const { result } = await renderHook(() => useChatbotViewModel());
  await waitFor(() => expect(result.current.profileName).toBe('Ana'));
  await act(async () => result.current.setDraft('  Olá  '));
  await act(async () => result.current.sendMessage());
  await waitFor(() => expect(result.current.messages).toHaveLength(2));
  expect(chatbotModel.sendMessage).toHaveBeenCalledWith({ message: 'Olá' });
  expect(result.current.messages[1].text).toBe('Anotado');
  expect(result.current.conversationId).toBe('c1');
});

test('permite reenviar mensagem que falhou sem duplicá-la', async () => {
  jest.mocked(chatbotModel.sendMessage).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ message: 'Pronto', conversationId: 'c1' } as never);
  const { result } = await renderHook(() => useChatbotViewModel());
  await waitFor(() => expect(result.current.isLoadingConversations).toBe(false));
  await act(async () => result.current.setDraft('Teste'));
  await act(async () => result.current.sendMessage());
  await waitFor(() => expect(result.current.messages[0]?.status).toBe('error'));
  await act(async () => result.current.retryLastMessage());
  await waitFor(() => expect(result.current.messages).toHaveLength(2));
  expect(result.current.messages[0].status).toBe('sent');
  expect(chatbotModel.sendMessage).toHaveBeenCalledTimes(2);
});

test('abre histórico e inicia nova conversa', async () => {
  jest.mocked(chatbotModel.listMessages).mockResolvedValue([{ role: 'USER', text: 'Anterior' }] as never);
  const { result } = await renderHook(() => useChatbotViewModel());
  await waitFor(() => expect(result.current.isLoadingConversations).toBe(false));
  await act(async () => result.current.openConversation('c1'));
  expect(result.current.messages[0].text).toBe('Anterior');
  await act(async () => result.current.newConversation());
  expect(result.current.messages).toEqual([]);
  expect(result.current.conversationId).toBeNull();
});
