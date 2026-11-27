/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import { GoogleIcon } from './GoogleIcon';
test('GoogleIcon aceita tamanho', async () => {
  expect((await render(<GoogleIcon size={20} />)).toJSON()).toBeTruthy();
});
