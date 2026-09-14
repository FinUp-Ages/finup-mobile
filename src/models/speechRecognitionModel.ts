import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import type {
  ExpoSpeechRecognitionErrorCode,
  ExpoSpeechRecognitionOptions,
} from 'expo-speech-recognition';
import type { DeviceSpeechSupport } from '@/types/speech';

/**
 * MODEL - acesso ao reconhecedor de fala do aparelho.
 *
 * Aqui a fonte de dado nao e a API: e o modulo nativo. So este arquivo sabe que
 * `expo-speech-recognition` existe e como o reconhecedor e configurado. Trocar a
 * biblioteca — ou trocar o reconhecedor do sistema por um modelo empacotado,
 * tipo Whisper ou Vosk — mexe aqui e em mais lugar nenhum.
 *
 * Regra de ouro do repositorio: uma View NUNCA importa um Model direto —
 * sempre via ViewModel.
 *
 * IMPORTANTE: modulo nativo nao roda no Expo Go. A POC exige build de
 * desenvolvimento (`npx expo run:android`).
 */

/** Idioma da POC. O modelo offline precisa estar baixado para este locale. */
export const SPEECH_LOCALE = 'pt-BR';

/**
 * Servico de reconhecimento no proprio aparelho do Android ("Speech Services by
 * Google" / Android System Intelligence). E ele que mantem a transcricao
 * funcionando sem internet.
 */
export const ON_DEVICE_SERVICE_PACKAGE = 'com.google.android.as';

/**
 * Silencio que encerra a captura, em ms. A POC e de frase curta: fechar rapido
 * demais corta a fala no meio, devagar demais faz o usuario esperar a toa.
 *
 * 1500ms se mostrou curto demais na pratica: uma pausa natural no meio da frase
 * (numero por extenso, hesitacao entre palavras) e suficiente para o reconhecedor
 * decidir que a fala terminou e devolver `no-speech`. O componente de bench que deu
 * origem a esta POC usa 8000ms; aqui ficamos num meio-termo que ainda fecha sozinho
 * rapido o bastante para o fluxo de frase curta.
 */
export const SILENCE_TIMEOUT_MS = 3_500;

/** Intervalo dos eventos de volume que alimentam a barra de nivel do microfone. */
export const VOLUME_EVENT_INTERVAL_MS = 100;

/**
 * Faixa util do valor de volume do modulo nativo (-2 a 10; abaixo de 0 e
 * inaudivel). Serve para normalizar a amplitude em 0..1.
 */
export const VOLUME_RANGE = { max: 8, min: 0 } as const;

/**
 * Reexportado para que nenhuma outra camada precise importar a biblioteca
 * direto — o ViewModel assina os eventos nativos por aqui.
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
 * Le o que o aparelho oferece. E esta leitura que responde a pergunta central da
 * POC: da para transcrever sem internet neste aparelho?
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
    defaultService,
    hasOfflineLocale: installedLocales.some((locale) =>
      locale.toLowerCase().startsWith(SPEECH_LOCALE.toLowerCase()),
    ),
    hasOnDevicePackage,
    installedLocales,
    onDeviceSupported: ExpoSpeechRecognitionModule.supportsOnDeviceRecognition(),
    recognitionAvailable: ExpoSpeechRecognitionModule.isRecognitionAvailable(),
    services,
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
    addsPunctuation: true,
    androidIntentOptions: {
      EXTRA_MASK_OFFENSIVE_WORDS: false,
      EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: SILENCE_TIMEOUT_MS,
      EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: SILENCE_TIMEOUT_MS,
    },
    androidRecognitionServicePackage: support?.hasOnDevicePackage
      ? ON_DEVICE_SERVICE_PACKAGE
      : undefined,
    continuous: false,
    interimResults: true,
    lang: SPEECH_LOCALE,
    // Uma alternativa basta: menos dados atravessando a ponte por evento.
    maxAlternatives: 1,
    requiresOnDeviceRecognition: true,
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
      message: 'O download manual de modelo so existe no Android.',
      status: 'unsupported',
    };
  }
  return ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({
    locale: SPEECH_LOCALE,
  });
}
