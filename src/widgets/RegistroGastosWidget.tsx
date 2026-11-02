import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { WIDGET_LINKS } from '@/models/widgetLaunchModel';
import { colors } from '@/theme/colors';
import { LOGO_AREA, LOGO_WITH_GLOW_SVG, MIC_SVG } from '@/widgets/widgetSvgs';

/**
 * WIDGET - "Registre seus gastos" na tela inicial do Android (Figma: no 223-13475,
 * mockup da direita).
 *
 * Como a barra de pesquisa do Google, o widget nao recebe digitacao: o campo abre
 * o chat pronto para escrever e o microfone abre o chat ja gravando (ver
 * widgetLaunchModel). O resto do card tambem abre o chat para escrever.
 *
 * Nao e uma View do React Native: o react-native-android-widget converte estes
 * componentes em layout nativo (RemoteViews), entao so aceita os estilos dele.
 */
export function RegistroGastosWidget() {
  return (
    <FlexWidget
      accessibilityLabel="FinUp: registrar gasto"
      clickAction="OPEN_URI"
      clickActionData={{ uri: WIDGET_LINKS.texto }}
      style={{
        // Figma: degrade #021736 -> #0060c8, raio 28.
        alignItems: 'center',
        backgroundGradient: {
          from: colors.navy,
          orientation: 'TOP_BOTTOM',
          to: colors.widgetGradientBottom,
        },
        borderRadius: 28,
        flexDirection: 'column',
        height: 'match_parent',
        justifyContent: 'space-between',
        paddingBottom: 20,
        paddingHorizontal: 24,
        paddingTop: 12,
        width: 'match_parent',
      }}
    >
      <SvgWidget
        svg={LOGO_WITH_GLOW_SVG}
        style={{ height: LOGO_AREA.height, width: LOGO_AREA.width }}
      />

      {/* Campo: branco-acinzentado 38%, raio 12; texto 12 a 67% e microfone a direita. */}
      <FlexWidget
        accessibilityLabel="Registre seus gastos por texto"
        clickAction="OPEN_URI"
        clickActionData={{ uri: WIDGET_LINKS.texto }}
        style={{
          alignItems: 'center',
          backgroundColor: colors.widgetField,
          borderRadius: 12,
          flexDirection: 'row',
          height: 32,
          paddingLeft: 12,
          width: 'match_parent',
        }}
      >
        <FlexWidget style={{ flex: 1 }}>
          <TextWidget
            style={{ color: colors.widgetFieldText, fontFamily: 'Inter_400Regular', fontSize: 12 }}
            text="Registre seus gastos"
          />
        </FlexWidget>
        <FlexWidget
          accessibilityLabel="Registre seus gastos por voz"
          clickAction="OPEN_URI"
          clickActionData={{ uri: WIDGET_LINKS.voz }}
          style={{
            alignItems: 'center',
            height: 'match_parent',
            justifyContent: 'center',
            width: 44,
          }}
        >
          <SvgWidget svg={MIC_SVG} style={{ height: 16, width: 16 }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
