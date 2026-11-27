/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { CadastroStepDados } from './CadastroStepDados';
import { CadastroStepAdicionais } from './CadastroStepAdicionais';
import { CadastroStepSenha } from './CadastroStepSenha';
import { CadastroStepCodigo } from './CadastroStepCodigo';

test('etapa de dados encaminha entrada, blur e erros', async () => {
  const onChange = jest.fn(), onTouch = jest.fn();
  const screen = await render(<CadastroStepDados data={{ nome: '', sobrenome: '', email: '', celular: '' }} errors={{ email: 'E-mail inválido' }} onChange={onChange} onTouch={onTouch} />);
  await fireEvent.changeText(screen.getByPlaceholderText('Nome'), 'Ana');
  await fireEvent(screen.getByPlaceholderText('Nome'), 'blur');
  expect(onChange).toHaveBeenCalledWith('nome', 'Ana');
  expect(onTouch).toHaveBeenCalledWith('nome');
  expect(screen.getByText('E-mail inválido')).toBeTruthy();
});

test('etapa adicional permite celular, data e profissão personalizada', async () => {
  const onChange = jest.fn(), onTouch = jest.fn();
  const data = { celular: '', birthDate: '', monthlyIncome: '', profissao: '' };
  const screen = await render(<CadastroStepAdicionais data={data} errors={{}} onChange={onChange} onTouch={onTouch} showCelular />);
  await fireEvent.changeText(screen.getByPlaceholderText('Celular'), '11999998888');
  await fireEvent.changeText(screen.getByPlaceholderText('Data de nascimento'), '02012000');
  expect(onChange).toHaveBeenCalledWith('birthDate', '2000-01-02');
  await fireEvent.press(screen.getByText('Profissão'));
  await fireEvent.press(screen.getByText('Outra'));
  await fireEvent.changeText(screen.getByPlaceholderText('Digite sua profissão'), 'Artista');
  expect(onChange).toHaveBeenCalledWith('profissao', 'Artista');
});

test('etapa de senha encaminha valores e validações visíveis', async () => {
  const onChange = jest.fn();
  const screen = await render(<CadastroStepSenha data={{ senha: '', confirmarSenha: '' }} errors={{ confirmarSenha: 'As senhas não coincidem.' }} onChange={onChange} onTouch={jest.fn()} />);
  await fireEvent.changeText(screen.getByPlaceholderText('Senha'), 'Senha123!');
  expect(onChange).toHaveBeenCalledWith('senha', 'Senha123!');
  expect(screen.getByText('As senhas não coincidem.')).toBeTruthy();
});

test('código permite digitação e reenvio e mostra confirmação', async () => {
  const onChangeCode = jest.fn(), onResend = jest.fn();
  const props = { email: ' ANA@EXEMPLO.COM ', code: '', confirmed: false, resending: false, codeResent: true, onChangeCode, onResend };
  const screen = await render(<CadastroStepCodigo {...props} />);
  expect(screen.getByText(/ana@exemplo.com/)).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Código de confirmação'), '123456');
  await fireEvent.press(screen.getByText('Reenviar código'));
  expect(onChangeCode).toHaveBeenCalledWith('123456');
  expect(onResend).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Código reenviado.')).toBeTruthy();
  await screen.rerender(<CadastroStepCodigo {...props} confirmed />);
  expect(screen.getByText('E-mail confirmado')).toBeTruthy();
});
