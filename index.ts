// Ponto de entrada: o app (Expo Router) e o desenho do widget da tela inicial do
// Android, que roda em segundo plano sem abrir o app (ver src/widgets).
import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from '@/widgets/widgetTaskHandler';

registerWidgetTaskHandler(widgetTaskHandler);
