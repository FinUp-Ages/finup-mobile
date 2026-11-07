import { useEffect } from 'react';
import { AppState } from 'react-native';
import { transactionEvents } from '@/models/transactionEvents';
import { widgetModel } from '@/models/widgetModel';
import { androidWidgetPackage } from '@/widgets/androidWidgetPackage';

/**
 * Redesenha o widget da tela inicial com saudacao, gastos e dica atuais. Sem
 * widget na tela inicial o renderWidget nao e chamado e nada e buscado no back.
 * Sem o modulo nativo (Expo Go, iOS) nao faz nada.
 */
export async function refreshRegistroGastosWidget(): Promise<void> {
  if (!androidWidgetPackage) return;
  try {
    // O desenho importa o pacote do widget: so carrega com o modulo nativo presente.
    const { REGISTRO_GASTOS_WIDGET_NAME, RegistroGastosWidget } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/widgets/RegistroGastosWidget') as typeof import('@/widgets/RegistroGastosWidget');
    await androidWidgetPackage.requestWidgetUpdate({
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
