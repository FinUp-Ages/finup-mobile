import { Stack } from 'expo-router';
import React from 'react';

/**
 * ROTA - layout do grupo (auth): fluxo nao autenticado (login, cadastro,
 * recuperacao). Sem header nativo - cada tela desenha o proprio cabecalho,
 * para bater com o Figma (botao "X", titulo centralizado, "< Voltar").
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
