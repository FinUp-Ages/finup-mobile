/// <reference types="jest" />
import { httpClient } from '@/config/httpClient';
import { chatbotModel } from './chatbotModel';
jest.mock('@/config/httpClient', () => ({ httpClient: { get: jest.fn(), post: jest.fn() } }));
test('codifica conversa e envia texto com timeout específico', async () => {
  await chatbotModel.listMessages('a/b');
  await chatbotModel.sendMessage({ message: 'Olá', conversationId: 'c1' });
  expect(httpClient.get).toHaveBeenCalledWith('/api/v1/assistant/conversations/a%2Fb/messages');
  expect(httpClient.post).toHaveBeenCalledWith('/api/v1/ai/assistant', { message: 'Olá', conversationId: 'c1' }, { timeoutMs: 60000 });
});
