import { Tabs } from 'expo-router';
import React from 'react';
import { FinUpTabBar } from '@/components/navigation/FinUpTabBar';
import { TabBarClearanceProvider } from '@/components/navigation/TabBarClearance';
import { darkColors } from '@/theme/colors';

/**
 * ROTA - layout do grupo (tabs): barra de abas do FinUp (Carteira, Analise, Transacao,
 * Educacional, Chatbot).
 *
 * A barra e propria (components/navigation/FinUpTabBar): capsula flutuante de vidro, aba ativa
 * em capsula azul e Transacao como orbe central. Ela fica no fluxo (abaixo das telas), entao as
 * telas terminam acima dela e nao precisam de folga extra embaixo. Substitui a NativeTabs da
 * plataforma, que nao aceita esse desenho. As telas cuidam do proprio topo (sem cabecalho).
 *
 * Os parenteses fazem de "(tabs)" um grupo: as rotas respondem em "/carteira",
 * "/analise", "/transacao", "/educacional" e "/chatbot"; o app abre em "/carteira"
 * (Home). Perfil e Transcricao
 * ficam fora da barra, como rotas da pilha raiz (app/_layout.tsx).
 */
// O app abre na Home (Carteira).
export const unstable_settings = { anchor: 'carteira' };

export default function TabsLayout() {
  return (
    <TabBarClearanceProvider>
      <Tabs
        backBehavior="initialRoute"
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: darkColors.background },
        }}
        tabBar={(props) => <FinUpTabBar {...props} />}
      >
        <Tabs.Screen name="carteira" options={{ title: 'Carteira' }} />
        <Tabs.Screen name="analise" options={{ title: 'Análise' }} />
        <Tabs.Screen name="transacao" options={{ title: 'Transação' }} />
        <Tabs.Screen name="educacional" options={{ title: 'Educacional' }} />
        <Tabs.Screen name="chatbot" options={{ title: 'Chatbot' }} />
      </Tabs>
    </TabBarClearanceProvider>
  );
}
