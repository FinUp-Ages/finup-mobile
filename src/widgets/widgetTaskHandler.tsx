import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { widgetModel } from '@/models/widgetModel';
import { RegistroGastosWidget } from '@/widgets/RegistroGastosWidget';

/**
 * Chamado pelo Android (headless JS) quando o widget e adicionado, atualizado ou
 * redimensionado. Os toques nao passam por aqui: `OPEN_URI` abre o app direto.
 */
export async function widgetTaskHandler({
  renderWidget,
  widgetAction,
  widgetInfo,
}: WidgetTaskHandlerProps) {
  if (
    widgetAction === 'WIDGET_ADDED' ||
    widgetAction === 'WIDGET_UPDATE' ||
    widgetAction === 'WIDGET_RESIZED'
  ) {
    renderWidget(
      <RegistroGastosWidget {...await widgetModel.loadContent()} height={widgetInfo.height} />,
    );
  }
}
