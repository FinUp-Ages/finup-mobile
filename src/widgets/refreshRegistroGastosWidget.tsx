import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { transactionEvents } from '@/models/transactionEvents';
import { widgetModel } from '@/models/widgetModel';
import { REGISTRO_GASTOS_WIDGET_NAME, RegistroGastosWidget } from '@/widgets/RegistroGastosWidget';

/**
 * Redesenha o widget da tela inicial com saudacao, gastos e dica atuais. Sem
 * widget na tela inicial o renderWidget nao e chamado e nada e buscado no back.
 */
export async function refreshRegistroGastosWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await requestWidgetUpdate({
      widgetName: REGISTRO_GASTOS_WIDGET_NAME,
      renderWidget: async ({ height }) => (
        <RegistroGastosWidget {...await widgetModel.loadContent()} height={height} />
      ),
    });
  } catch (error) {
    if (__DEV__) console.warn('[widget] falha ao atualizar o widget.', error);
  }
}

/**
 * Mantem o widget em dia enquanto o app roda: ao abrir, ao registrar uma transacao
 * (transactionEvents) e ao ir para segundo plano, o que cobre login, logout e
 * lancamentos feitos em outras telas.
 */
export function useRegistroGastosWidgetRefresh(): void {
  useEffect(() => {
    void refreshRegistroGastosWidget();
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'background') void refreshRegistroGastosWidget();
    });
    const unsubscribe = transactionEvents.subscribe(() => void refreshRegistroGastosWidget());
    return () => {
      appState.remove();
      unsubscribe();
    };
  }, []);
}
