import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * ROTA - layout raiz, obrigatorio pelo Expo Router.
 *
 * Envolve todas as rotas do app. Providers globais (tema, auth, i18n) entram
 * aqui. Nenhuma tela e declarada neste arquivo: telas moram em views/.
 *
 * SafeAreaProvider precisa envolver tudo para que `useSafeAreaInsets` e
 * `SafeAreaView` (de react-native-safe-area-context) funcionem em qualquer tela.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTitleAlign: 'center', animation: 'fade' }}>
        <Stack.Screen name="index" options={{ headerShown: false}} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
