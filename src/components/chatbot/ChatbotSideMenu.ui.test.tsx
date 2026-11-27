/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { ChatbotSideMenu } from './ChatbotSideMenu';

const props = { activeConversationId: null, conversations: [], disabled: false, error: null, isLoading: false, visible: true, onClose: jest.fn(), onNewConversation: jest.fn(), onRetry: jest.fn(), onSelectConversation: jest.fn() };
beforeEach(() => jest.clearAllMocks());

test('mostra estado vazio e permite iniciar conversa', async () => {
  const screen = await render(<ChatbotSideMenu {...props} />);
  expect(screen.getByText('Nenhuma conversa ainda.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Nova conversa'));
  expect(props.onNewConversation).toHaveBeenCalledTimes(1);
});

test('apresenta erro e permite tentar novamente', async () => {
  const screen = await render(<ChatbotSideMenu {...props} error="Falha ao carregar" />);
  expect(screen.getByText('Falha ao carregar')).toBeTruthy();
  await fireEvent.press(screen.getByText('Tentar novamente'));
  expect(props.onRetry).toHaveBeenCalledTimes(1);
});

test('abre conversa selecionada e bloqueia seleção durante envio', async () => {
  const conversations = [{ id: 'c1', title: 'Planejamento' }] as never;
  const screen = await render(<ChatbotSideMenu {...props} conversations={conversations} />);
  await fireEvent.press(screen.getByText('Planejamento'));
  expect(props.onSelectConversation).toHaveBeenCalledWith('c1');
  await screen.rerender(<ChatbotSideMenu {...props} conversations={conversations} disabled />);
  await fireEvent.press(screen.getByText('Planejamento'));
  expect(props.onSelectConversation).toHaveBeenCalledTimes(1);
});
