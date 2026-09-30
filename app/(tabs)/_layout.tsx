import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { authModel } from '@/models/authModel';

/**
 * ROTA - layout do grupo (tabs).
 *
 * Os parenteses fazem de "(tabs)" um grupo: ele organiza as rotas sem aparecer
 * na URL. As rotas abaixo respondem em "/profile" e "/transcricao".
 */
export default function TabsLayout() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    authModel
      .hasSession()
      .then((hasSession) => {
        if (!active) return;
        if (!hasSession) {
          router.replace('/(auth)');
          return;
        }
        setCheckingSession(false);
      })
      .catch(() => {
        if (active) router.replace('/(auth)');
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (checkingSession) return null;

  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="transcricao" options={{ title: 'Transcrição' }} />
      <Tabs.Screen name="chatbot" options={{ headerShown: false, title: 'Chatbot' }} />
    </Tabs>
  );
}
