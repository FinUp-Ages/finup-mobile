import { Tabs } from 'expo-router';
import React from 'react';

/**
 * ROTA - layout do grupo (tabs).
 *
 * Os parenteses fazem de "(tabs)" um grupo: ele organiza as rotas sem aparecer
 * na URL. A rota abaixo responde em "/profile".
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
