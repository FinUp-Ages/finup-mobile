/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { ChatbotHeader } from './ChatbotHeader';
import { ChatbotWelcome } from './ChatbotWelcome';

test('chat mostra saudação contextual e abre menu', async () => {
  const onOpenMenu = jest.fn();
  const { getByLabelText, getByText, rerender, queryByLabelText } = await render(
    <ChatbotHeader onOpenMenu={onOpenMenu} showAssistantStatus />,
  );
  expect(getByLabelText('Assistente financeiro')).toBeTruthy();
  await fireEvent.press(getByLabelText('Abrir menu'));
  expect(onOpenMenu).toHaveBeenCalledTimes(1);
  await rerender(<ChatbotWelcome profileName="Ana" />);
  expect(getByText('Olá, Ana!')).toBeTruthy();
  await rerender(<ChatbotWelcome profileName={null} />);
  expect(getByText('Olá!')).toBeTruthy();
  expect(queryByLabelText('Assistente financeiro')).toBeNull();
});
