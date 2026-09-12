/**
 * Layout das abas principais do app autenticado.
 * Cada aba corresponde a um arquivo de rota dentro deste grupo.
 *
 * Por enquanto ha uma aba so: a POC de transcricao de voz.
 */
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
      }}
    >
      <Tabs.Screen name="transcricao" options={{ title: 'Transcrição' }} />
    </Tabs>
  );
}
