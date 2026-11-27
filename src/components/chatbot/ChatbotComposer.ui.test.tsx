/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { ChatbotComposer } from './ChatbotComposer';

const props = {
  draft: '', focusRequest: 0, isSending: false,
  onCancelVoice: jest.fn(), onChangeDraft: jest.fn(), onSend: jest.fn(),
  onStartVoice: jest.fn(), onStopVoice: jest.fn(), voiceDisabled: false,
  voiceHandsFree: false, voiceMessage: null, voiceStartedAt: null,
  voiceStatus: 'idle' as const,
};

beforeEach(() => jest.clearAllMocks());

test('encaminha texto digitado e impede envio de mensagem vazia', async () => {
  const screen = await render(<ChatbotComposer {...props} />);
  await fireEvent.changeText(screen.getByLabelText('Digite sua mensagem'), 'Olá');
  expect(props.onChangeDraft).toHaveBeenCalledWith('Olá');
  await fireEvent.press(screen.getByLabelText('Enviar mensagem'));
  expect(props.onSend).not.toHaveBeenCalled();
});

test('envia texto preenchido', async () => {
  const screen = await render(<ChatbotComposer {...props} draft="Olá" />);
  await fireEvent.press(screen.getByLabelText('Enviar mensagem'));
  expect(props.onSend).toHaveBeenCalledTimes(1);
});

test('apresenta erro de voz e estado de processamento', async () => {
  const screen = await render(<ChatbotComposer {...props} voiceMessage="Microfone indisponível" />);
  expect(screen.getByText('Microfone indisponível')).toBeTruthy();
  await screen.rerender(<ChatbotComposer {...props} voiceStatus="processing" />);
  expect(screen.getByText('Enviando áudio...')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Enviar mensagem'));
  expect(props.onSend).not.toHaveBeenCalled();
});
