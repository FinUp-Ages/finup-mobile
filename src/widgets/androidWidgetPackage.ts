import { Platform } from 'react-native';

type AndroidWidgetPackage = typeof import('react-native-android-widget');

/**
 * Pacote do widget da tela inicial, ou null onde o modulo nativo nao existe.
 *
 * O `react-native-android-widget` procura o modulo nativo (`AndroidWidget`) ja ao
 * ser importado e lanca erro quando ele nao esta no binario: no Expo Go, que nao
 * embarca o pacote, um import direto derrubaria o app na abertura. Carregar
 * preguicosamente deixa o resto do app abrir, como no speechRecognitionModel;
 * no development build e no APK o widget segue normal. Fora do Android nao ha
 * widget.
 *
 * Quem importa algo do pacote (RegistroGastosWidget, widgetTaskHandler) so pode
 * ser carregado depois de conferir que este valor nao e null.
 */
function loadAndroidWidgetPackage(): AndroidWidgetPackage | null {
  if (Platform.OS !== 'android') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-android-widget') as AndroidWidgetPackage;
  } catch {
    return null;
  }
}

export const androidWidgetPackage = loadAndroidWidgetPackage();
