import { Redirect } from 'expo-router';
import React from 'react';

/**
 * Rota de entrada.
 * Redireciona para (auth) ou (tabs) conforme o estado da sessao.
 */
export default function Index() {
  return <Redirect href="/(auth)" />;
}
