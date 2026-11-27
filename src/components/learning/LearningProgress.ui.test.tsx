/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import { LearningProgress } from './LearningProgress';

test('anuncia progresso disponível e indisponível', async () => {
  const screen = await render(<LearningProgress value={75} />);
  expect(screen.getByLabelText('Progresso no curso')).toBeTruthy();
  expect(screen.getByText('75%')).toBeTruthy();
  await screen.rerender(<LearningProgress value={null} />);
  expect(screen.getByLabelText('Progresso ainda não disponível')).toBeTruthy();
  expect(screen.getByText('—')).toBeTruthy();
  await screen.rerender(<LearningProgress value={100} demo />);
  expect(screen.getByLabelText('Progresso de demonstração no curso')).toBeTruthy();
  expect(screen.getByText('100%')).toBeTruthy();
});
