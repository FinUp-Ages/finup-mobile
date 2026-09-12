/**
 * Unico ponto do app que conhece o modulo nativo `expo-speech-recognition`.
 *
 * Mesma ideia dos services de API: a tela e o hook falam com este arquivo, e
 * so ele sabe como o reconhecedor e configurado. Trocar a biblioteca (ou trocar
 * o reconhecimento nativo por um modelo empacotado, tipo Whisper/Vosk) mexe
 * aqui e em mais lugar nenhum.
 *
 * IMPORTANTE: modulo nativo nao roda no Expo Go. A POC exige development build
 * ou APK (`eas build --profile development --platform android`).
 */
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import type {
  ExpoSpeechRecognitionErrorCode,
  ExpoSpeechRecognitionOptions,
} from 'expo-speech-recognition';

import {
  ON_DEVICE_SERVICE_PACKAGE,
  SILENCE_TIMEOUT_MS,
  SPEECH_LOCALE,
  VOLUME_EVENT_INTERVAL_MS,
} from '@/constants/speech';
import type { DeviceSpeechSupport } from '@/types/speech';

/**
 * Reexportado para que nenhum outro arquivo precise importar a biblioteca
 * direto — o hook assina os eventos nativos por aqui.
 */
export { useSpeechRecognitionEvent };
export type { ExpoSpeechRecognitionErrorCode };

/**
 * Pede microfone (e, no iOS, tambem reconhecimento de fala).
 * Retorna `false` quando o usuario nega.
 */
export async function requestSpeechPermission(): Promise<boolean> {
  const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return permission.granted;
}

/**
 * Le o que o aparelho oferece. E esta leitura que responde a pergunta central
 * da POC: da para transcrever sem internet neste aparelho?
 */
export async function readDeviceSupport(): Promise<DeviceSpeechSupport> {
  const services = ExpoSpeechRecognitionModule.getSpeechRecognitionServices();
  const hasOnDevicePackage = services.includes(ON_DEVICE_SERVICE_PACKAGE);

  let defaultService = '';
  try {
    defaultService = ExpoSpeechRecognitionModule.getDefaultRecognitionService().packageName;
  } catch {
    // Nem todo aparelho expoe o servico padrao; a POC segue sem essa informacao.
  }

  let installedLocales: string[] = [];
  try {
    const locales = await ExpoSpeechRecognitionModule.getSupportedLocales({
      androidRecognitionServicePackage: hasOnDevicePackage ? ON_DEVICE_SERVICE_PACKAGE : undefined,
    });
    installedLocales = locales.installedLocales;
  } catch {
    // O servico pode recusar a consulta. Nesse caso nao da para afirmar que o
    // modelo offline existe: `hasOfflineLocale` fica false e a tela avisa.
  }

  return {
    onDeviceSupported: ExpoSpeechRecognitionModule.supportsOnDeviceRecognition(),
    recognitionAvailable: ExpoSpeechRecognitionModule.isRecognitionAvailable(),
    services,
    defaultService,
    installedLocales,
    hasOnDevicePackage,
    hasOfflineLocale: installedLocales.some((locale) =>
      locale.toLowerCase().startsWith(SPEECH_LOCALE.toLowerCase()),
    ),
  };
}

/**
 * Opcoes de uma captura da POC.
 *
 * `requiresOnDeviceRecognition` e o que garante o offline: com ele ligado o
 * audio nao sai do aparelho. `continuous: false` fecha a sessao sozinha depois
 * do silencio — o fluxo aqui e uma frase curta por vez, nao ditado continuo.
 */
export function buildRecognitionOptions(
  support: DeviceSpeechSupport | null,
): ExpoSpeechRecognitionOptions {
  return {
    lang: SPEECH_LOCALE,
    interimResults: true,
    continuous: false,
    // Uma alternativa basta: menos dados atravessando a ponte por evento.
    maxAlternatives: 1,
    requiresOnDeviceRecognition: true,
    addsPunctuation: true,
    androidRecognitionServicePackage: support?.hasOnDevicePackage
      ? ON_DEVICE_SERVICE_PACKAGE
      : undefined,
    androidIntentOptions: {
      EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: SILENCE_TIMEOUT_MS,
      EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: SILENCE_TIMEOUT_MS,
      EXTRA_MASK_OFFENSIVE_WORDS: false,
    },
    volumeChangeEventOptions: {
      enabled: true,
      intervalMillis: VOLUME_EVENT_INTERVAL_MS,
    },
  };
}

/** Abre o microfone e comeca a reconhecer. Lanca se o servico recusar. */
export function startTranscription(options: ExpoSpeechRecognitionOptions): void {
  ExpoSpeechRecognitionModule.start(options);
}

/** Encerra a captura entregando o ultimo resultado final. */
export function stopTranscription(): void {
  ExpoSpeechRecognitionModule.stop();
}

/** Encerra a captura descartando o resultado (usado ao sair da tela). */
export function abortTranscription(): void {
  ExpoSpeechRecognitionModule.abort();
}

/**
 * Dispara o download do modelo offline do idioma (Android 13+).
 * Em algumas versoes o sistema apenas agenda e conclui depois, no Wi-Fi.
 */
export async function downloadOfflineModel(): Promise<{ status: string; message: string }> {
  if (Platform.OS !== 'android') {
    return {
      status: 'unsupported',
      message: 'O download manual de modelo so existe no Android.',
    };
  }
  return ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({
    locale: SPEECH_LOCALE,
  });
}
