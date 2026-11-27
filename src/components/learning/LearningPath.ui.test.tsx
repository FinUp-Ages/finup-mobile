/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import type { StudyLevel } from '@/types/studyTrack';
import { LearningPath } from './LearningPath';

test('abre nível alcançado e bloqueia nível ainda não alcançado', async () => {
  const onOpen = jest.fn();
  const levels = [{ number: 1, stars: 2, reached: true, question: { id: 'a' } }, { number: 2, stars: 0, reached: false, question: { id: 'b' } }] as StudyLevel[];
  const screen = await render(<LearningPath levels={levels} onOpen={onOpen} />);
  await fireEvent.press(screen.getByLabelText('Nível 1, 2 de 3 estrelas'));
  expect(onOpen).toHaveBeenCalledWith(levels[0]);
  await fireEvent.press(screen.getByLabelText('Nível 2, 0 de 3 estrelas, ainda não alcançado'));
  expect(onOpen).toHaveBeenCalledTimes(1);
});
