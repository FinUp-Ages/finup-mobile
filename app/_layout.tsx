import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Rota raiz do Expo Router.
 *
 * Envolve todas as rotas do app. Providers globais — como tema,
 * autenticação e internacionalização — entram aqui.
 *
 * SafeAreaProvider permite o uso de useSafeAreaInsets e SafeAreaView
 * em qualquer tela do aplicativo.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ animation: 'fade', headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
