/// <reference types="jest" />
import type { CadastroFormData } from '@/types/cadastro';
import { toAdditionalInfo, toSignUpInput } from './cadastroModel';
const form: CadastroFormData = { nome: ' Ana ', sobrenome: ' Silva ', email: ' ANA@EXEMPLO.COM ', celular: '(11) 99999-8888', birthDate: '2000-01-02', monthlyIncome: 'ate-2500', profissao: ' Médica ', senha: 'senha', confirmarSenha: 'senha' };
test('normaliza dados de cadastro', () => {
  expect(toSignUpInput(form, 'usuario')).toEqual({ username: 'usuario', password: 'senha', email: 'ana@exemplo.com', name: 'Ana Silva', birthdate: '2000-01-02' });
  expect(toAdditionalInfo(form)).toEqual({ phone: '+5511999998888', profession: 'Médica', birthDate: '2000-01-02', monthlyIncome: 2500 });
});
test('omite dados opcionais inválidos ou vazios', () => {
  expect(toAdditionalInfo({ ...form, celular: '123', profissao: ' ', birthDate: '', monthlyIncome: 'invalida' })).toEqual({});
});
