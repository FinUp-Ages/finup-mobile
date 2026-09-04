/**
 * Rota de entrada.
 * Redireciona para (auth) ou (tabs) conforme o estado da sessao.
 */
import ExampleScreen from '@/views/ExampleScreen';

export default function Index() {
  return (
    <ExampleScreen/>
  );
}
