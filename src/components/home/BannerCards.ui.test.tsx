/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { LearningBannerCard } from './LearningBannerCard';
import { ScoreBannerCard } from './ScoreBannerCard';

test('banners de educação e score encaminham para seus fluxos', async () => {
  const learning = jest.fn();
  const score = jest.fn();
  const { getByLabelText, rerender } = await render(<LearningBannerCard onPress={learning} />);
  await fireEvent.press(getByLabelText('Tipo Duolingo, mas para finanças. Comece agora'));
  expect(learning).toHaveBeenCalledTimes(1);

  await rerender(<ScoreBannerCard onPress={score} />);
  await fireEvent.press(
    getByLabelText('Adicione suas informações e aumente seu score. Adicionar agora'),
  );
  expect(score).toHaveBeenCalledTimes(1);
});
