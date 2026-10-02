import { Tabs } from 'expo-router';
import React from 'react';

/**
 * ROTA - layout do grupo (tabs).
 *
 * Os parenteses fazem de "(tabs)" um grupo: ele organiza as rotas sem aparecer
 * na URL. As rotas abaixo respondem em "/home", "/profile" e "/transcricao".
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      {/* A Home desenha o proprio cabecalho; a aba nativa fica para chegar ao Perfil. */}
      <Tabs.Screen name="home" options={{ headerShown: false, title: 'Início' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="transcricao" options={{ title: 'Transcrição' }} />
    </Tabs>
  );
}
