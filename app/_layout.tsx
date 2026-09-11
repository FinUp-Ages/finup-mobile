import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

/**
 * ROTA - layout raiz, obrigatorio pelo Expo Router.
 *
 * Envolve todas as rotas do app. Providers globais (tema, auth, i18n) entram
 * aqui. Nenhuma tela e declarada neste arquivo: telas moram em views/.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
