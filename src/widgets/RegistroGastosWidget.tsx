import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { WIDGET_LINKS } from '@/models/widgetLaunchModel';
import { colors } from '@/theme/colors';
import type { WidgetContent } from '@/utils/widgetContent';
import { editSvg, LOGO_BADGE_SVG, micSvg } from '@/widgets/widgetSvgs';

/** Mesmo `name` do widget no app.json (plugin react-native-android-widget). */
export const REGISTRO_GASTOS_WIDGET_NAME = 'RegistroGastos';

const FONT = 'Inter_400Regular';
const FIELD_HEIGHT = 48;
const MIC_SIZE = 36;

// Abaixo desta altura (dp) a logo some: o resto (saudacao, resumo e campo) ocupa
// ~110dp e cabe no minHeight de 140dp do app.json.
const COMPACT_MAX_HEIGHT = 170;

type Props = WidgetContent & {
  /** Altura real do widget na tela inicial, em dp (WidgetInfo.height). */
  height?: number;
};

/**
 * WIDGET - "Registre seus gastos" na tela inicial do Android.
 *
 * Layout escolhido entre variacoes no Figma (arquivo "FinUp - Widget (variacoes)",
 * opcao C), proximo do mockup original (no 223-13475): logo ao centro, saudacao e
 * resumo de gastos numa linha e o campo branco com o microfone dentro, como a
 * barra de pesquisa do Google.
 *
 * O widget nao recebe digitacao: o campo abre o chat pronto para escrever e o
 * microfone abre o chat ja gravando (ver widgetLaunchModel). O resto do card
 * tambem abre o chat para escrever.
 *
 * Widget nao anima: o que muda e o conteudo (saudacao, gastos do dia e do mes e o
 * exemplo do campo), redesenhado pelo widgetModel quando o app abre, vai para
 * segundo plano ou registra uma transacao (ver refreshRegistroGastosWidget).
 *
 * Nao e uma View do React Native: o react-native-android-widget converte estes
 * componentes em layout nativo (RemoteViews), entao so aceita os estilos dele.
 */
export function RegistroGastosWidget({ title, subtitle, tip, height }: Props) {
  const showLogo = height === undefined || height >= COMPACT_MAX_HEIGHT;

  return (
    <FlexWidget
      accessibilityLabel="FinUp: registrar gasto"
      clickAction="OPEN_URI"
      clickActionData={{ uri: WIDGET_LINKS.texto }}
      style={{
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        width: 'match_parent',
      }}
    >
      {/* Cabecalho centralizado: logo, saudacao e resumo de gastos. */}
      <FlexWidget style={{ alignItems: 'center', flexDirection: 'column' }}>
        {showLogo ? (
          <SvgWidget svg={LOGO_BADGE_SVG} style={{ height: 40, marginBottom: 6, width: 40 }} />
        ) : null}
        <TextWidget
          maxLines={1}
          style={{ color: colors.white, fontFamily: FONT, fontSize: 16, textAlign: 'center' }}
          text={title}
          truncate="END"
        />
        <TextWidget
          maxLines={1}
          style={{
            color: colors.widgetSubtitle,
            fontFamily: FONT,
            fontSize: 12,
            marginTop: 2,
            textAlign: 'center',
          }}
          text={subtitle}
          truncate="END"
        />
      </FlexWidget>

      {/* Campo branco (texto) com o microfone dentro (voz). */}
      <FlexWidget
        accessibilityLabel="Registre seus gastos por texto"
        clickAction="OPEN_URI"
        clickActionData={{ uri: WIDGET_LINKS.texto }}
        style={{
          alignItems: 'center',
          backgroundColor: colors.widgetField,
          borderRadius: FIELD_HEIGHT / 2,
          flexDirection: 'row',
          height: FIELD_HEIGHT,
          paddingLeft: 18,
          paddingRight: (FIELD_HEIGHT - MIC_SIZE) / 2,
          width: 'match_parent',
        }}
      >
        <SvgWidget svg={editSvg(colors.widgetFieldText)} style={{ height: 20, width: 20 }} />
        <FlexWidget style={{ flex: 1, marginLeft: 10 }}>
          <TextWidget
            maxLines={1}
            style={{ color: colors.widgetFieldText, fontFamily: FONT, fontSize: 15 }}
            text={tip}
            truncate="END"
          />
        </FlexWidget>
        <FlexWidget
          accessibilityLabel="Registre seus gastos por voz"
          clickAction="OPEN_URI"
          clickActionData={{ uri: WIDGET_LINKS.voz }}
          style={{
            alignItems: 'center',
            backgroundColor: colors.navy,
            borderRadius: MIC_SIZE / 2,
            height: MIC_SIZE,
            justifyContent: 'center',
            width: MIC_SIZE,
          }}
        >
          <SvgWidget svg={micSvg(colors.white)} style={{ height: 20, width: 20 }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
