import type { ExpoConfig } from 'expo/config';

/**
 * Configuracao do app por ambiente.
 *
 * ATENCAO: tudo declarado em `extra` e embutido no binario e pode ser extraido
 * por qualquer pessoa. Nunca coloque chave de API, credencial ou segredo aqui.
 * Chamadas a servicos de terceiros passam sempre pelo backend.
 */
const config: ExpoConfig = {
  name: 'FinUp',
  slug: 'finup',
  version: '0.0.1',
  orientation: 'portrait',
  scheme: 'finup',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  ios: {
    supportsTablet: false,
    bundleIdentifier: 'br.com.finup',
  },
  android: {
    package: 'br.com.finup',
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
    },
  },

  plugins: ['expo-router', 'expo-secure-store'],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    eas: {
      // projectId: preenchido automaticamente no primeiro `eas init`
    },
  },
};

export default config;
