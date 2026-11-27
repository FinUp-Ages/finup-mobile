/// <reference types="jest" />

import { render } from '@testing-library/react-native';
import { StepProgress } from './StepProgress';

test('StepProgress mostra passos preenchidos', async () => {
  const { getByText } = await render(<StepProgress currentStep={2} totalSteps={5} />);

  expect(getByText('02/05')).toBeTruthy();
});
