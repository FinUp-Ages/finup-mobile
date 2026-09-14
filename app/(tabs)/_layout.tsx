import { Tabs } from 'expo-router';
import React from 'react';

/**
 * ROTA - layout do grupo (tabs).
 *
 * Os parenteses fazem de "(tabs)" um grupo: ele organiza as rotas sem aparecer
 * na URL. As rotas abaixo respondem em "/profile" e "/transcricao".
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="transcricao" options={{ title: 'Transcrição' }} />
    </Tabs>
  );
}
