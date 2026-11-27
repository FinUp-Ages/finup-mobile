/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { IntegrateCardsCard } from './IntegrateCardsCard';

test('IntegrateCardsCard explica a integração e dispara seu CTA', async () => {
  const onPressIntegrate = jest.fn();
  const { getByText } = await render(<IntegrateCardsCard onPressIntegrate={onPressIntegrate} />);
  expect(getByText(/Integre seus cartões/)).toBeTruthy();
  await fireEvent.press(getByText('Integrar cartões'));
  expect(onPressIntegrate).toHaveBeenCalledTimes(1);
});
