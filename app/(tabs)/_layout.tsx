import { Tabs } from 'expo-router';
import React from 'react';

/**
 * ROTA - layout do grupo (tabs).
 *
 * Os parenteses fazem de "(tabs)" um grupo: ele organiza as rotas sem aparecer
 * na URL. As rotas abaixo respondem em "/home" e "/profile".
 *
 * "/home" esconde a tab bar padrao do Expo Router (`tabBarStyle: { display:
 * 'none' }`): a HomeScreen desenha sua propria barra de navegacao, fiel ao
 * Figma (5 itens, com "Transacao" em destaque), que a tab bar nativa nao
 * reproduz. As outras 4 secoes dessa barra ainda nao tem rota implementada.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen
        name="home"
        options={{ headerShown: false, tabBarStyle: { display: 'none' }, title: 'Home' }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
