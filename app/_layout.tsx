import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setSessionExpiredHandler } from '@/config/httpClient';

/**
 * Rota raiz do Expo Router.
 *
 * Envolve todas as rotas do app. Providers globais — como tema,
 * autenticação e internacionalização — entram aqui.
 *
 * SafeAreaProvider permite o uso de useSafeAreaInsets e SafeAreaView
 * em qualquer tela do aplicativo.
 *
 * Sessão expirada (401 do back ou refresh token recusado, detectado no
 * httpClient): a sessão já foi limpa e o app volta para a tela inicial de
 * autenticação, de qualquer tela.
 */
export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    setSessionExpiredHandler(() => router.replace('/(auth)'));
    return () => setSessionExpiredHandler(null);
  }, [router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ animation: 'fade', headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        {/* Fora da barra de abas: abrem por cima, com cabecalho e voltar. */}
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Perfil' }} />
        <Stack.Screen name="transcricao" options={{ headerShown: true, title: 'Transcrição' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
