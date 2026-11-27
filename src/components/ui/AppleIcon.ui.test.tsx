/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import { AppleIcon } from './AppleIcon';
test('AppleIcon aceita cor', async () => {
  expect((await render(<AppleIcon color="#fff" size={20} />)).toJSON()).toBeTruthy();
});
