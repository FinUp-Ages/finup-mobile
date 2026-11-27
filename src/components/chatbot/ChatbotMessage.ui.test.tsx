/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import { ChatbotMessage } from './ChatbotMessage';
jest.mock('@ronradtke/react-native-markdown-display', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => React.createElement(Text, null, children),
    MarkdownIt: () => ({ disable: () => ({}) }),
  };
});
test('sinaliza falha no envio de mensagem do usuário', async () => {
  const screen = await render(<ChatbotMessage message={{ id: '1', role: 'user', status: 'error', text: 'Olá' }} />);
  expect(screen.getByText('Olá')).toBeTruthy();
  expect(screen.getByText('Mensagem não enviada')).toBeTruthy();
});
test('mostra confirmação quando assistente registra transação', async () => {
  const screen = await render(<ChatbotMessage message={{ id: '2', role: 'assistant', status: 'sent', text: 'Registrado', action: 'REGISTER_TRANSACTION' }} />);
  expect(screen.getByText('Transação registrada')).toBeTruthy();
});
