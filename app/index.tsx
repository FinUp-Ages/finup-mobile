/**
 * Rota de entrada.
 * Redireciona para (auth) ou (tabs) conforme o estado da sessao.
 *
 * Enquanto a sessao nao existe, entra direto na aba da POC de transcricao.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/transcricao" />;
}
