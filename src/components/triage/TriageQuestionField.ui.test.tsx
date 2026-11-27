/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import type { TriageQuestion } from '@/types/triage';
import { TriageQuestionField } from './TriageQuestionField';

const base: TriageQuestion = { id: 'q', text: 'Pergunta', type: 'BOOLEAN', required: true, options: null, min: null, max: null, decimals: null, requiredWhen: null };

test('responde pergunta booleana e anuncia erro', async () => {
  const onChange = jest.fn();
  const screen = await render(<TriageQuestionField question={base} value={undefined} error="Responda" onChange={onChange} />);
  expect(screen.getByText('Responda')).toBeTruthy();
  await fireEvent.press(screen.getByText('Não'));
  expect(onChange).toHaveBeenCalledWith(false);
});

test('adiciona e remove opções de múltipla escolha', async () => {
  const onChange = jest.fn();
  const question: TriageQuestion = { ...base, type: 'MULTIPLE_CHOICE', options: [{ value: 'a', label: 'Primeira' }, { value: 'b', label: 'Segunda' }] };
  const screen = await render(<TriageQuestionField question={question} value={['a']} onChange={onChange} />);
  await fireEvent.press(screen.getByText('Segunda'));
  expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
  await fireEvent.press(screen.getByText('Primeira'));
  expect(onChange).toHaveBeenLastCalledWith([]);
});

test('interpreta valores numéricos com vírgula e preserva entrada inválida', async () => {
  const onChange = jest.fn();
  const screen = await render(<TriageQuestionField question={{ ...base, type: 'NUMBER', decimals: 2 }} value={undefined} onChange={onChange} />);
  await fireEvent.changeText(screen.getByLabelText('Pergunta'), '12,50');
  expect(onChange).toHaveBeenLastCalledWith(12.5);
  await fireEvent.changeText(screen.getByLabelText('Pergunta'), 'inválido');
  expect(onChange).toHaveBeenLastCalledWith('inválido');
});
