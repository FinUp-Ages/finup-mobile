/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native';
import { HomeHeader } from './HomeHeader';

describe('HomeHeader', () => {
  it('mostra os dois estados de identidade e encaminha as ações', async () => {
    const onPressProfile = jest.fn();
    const onPressScore = jest.fn();
    const { getByLabelText, getByText, rerender } = await render(
      <HomeHeader
        onPressProfile={onPressProfile}
        onPressScore={onPressScore}
        score="82"
        userName="Ana"
      />,
    );

    expect(getByText('Olá, Ana!')).toBeTruthy();
    await fireEvent.press(getByLabelText('Abrir perfil'));
    await fireEvent.press(getByLabelText('FinUp Score 82'));

    expect(onPressProfile).toHaveBeenCalledTimes(1);
    expect(onPressScore).toHaveBeenCalledTimes(1);

    await rerender(
      <HomeHeader onPressProfile={jest.fn()} onPressScore={jest.fn()} score="-" userName={null} />,
    );

    expect(getByLabelText('FinUp Score indisponível')).toBeTruthy();
  });
});
