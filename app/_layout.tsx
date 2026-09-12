/**
 * Layout raiz do app.
 * Responsavel apenas por montar os providers globais (QueryClient, contexts, tema)
 * e por decidir entre o grupo (auth) e o grupo (tabs) conforme a sessao.
 * Nenhuma tela ou regra de negocio deve viver aqui.
 *
 * Hoje esta no minimo necessario para a POC de transcricao de voz rodar:
 * Stack + area segura + folha de estilos do NativeWind. QueryClientProvider e a
 * decisao de sessao entram quando o fluxo de autenticacao existir.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
