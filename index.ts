// Ponto de entrada: o app (Expo Router) e o desenho do widget da tela inicial do
// Android, que roda em segundo plano sem abrir o app (ver src/widgets).
import 'expo-router/entry';
import { androidWidgetPackage } from '@/widgets/androidWidgetPackage';

// Sem o modulo nativo (Expo Go, iOS, web) nao ha widget para desenhar.
if (androidWidgetPackage) {
  // O handler importa o desenho do widget, que importa o pacote: so carrega aqui.
  const { widgetTaskHandler } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@/widgets/widgetTaskHandler') as typeof import('@/widgets/widgetTaskHandler');
  androidWidgetPackage.registerWidgetTaskHandler(widgetTaskHandler);
}
