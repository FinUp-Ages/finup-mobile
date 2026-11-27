/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import { AlertIcon } from './AlertIcon';
test('AlertIcon renderiza', async () => {
  expect((await render(<AlertIcon />)).toJSON()).toBeTruthy();
});
