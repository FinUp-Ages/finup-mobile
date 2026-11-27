/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import { BrandGradient } from './BrandGradient';
test('BrandGradient renderiza', async () => {
  expect((await render(<BrandGradient />)).toJSON()).toBeTruthy();
});
