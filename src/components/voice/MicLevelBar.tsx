import { memo } from 'react';
import { Animated, View } from 'react-native';

type MicLevelBarProps = {
  /** Amplitude 0..1 do microfone, ja animada pelo hook. */
  level: Animated.Value;
  active: boolean;
};

/** Cores no objeto de estilo, e nao em className: o preenchimento e um
 *  `Animated.View`, que recebe estilo direto para animar no driver nativo. */
const FILL_ACTIVE = '#059669';
const FILL_IDLE = '#cbd5e1';

/**
 * Barra de nivel do microfone. A amplitude entra por `Animated.Value` e sai em
 * `transform`: zero render de JS por amostra de volume.
 */
function MicLevelBarImpl({ level, active }: MicLevelBarProps) {
  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: active ? FILL_ACTIVE : FILL_IDLE,
          // scaleX cresce a partir do centro; ancoramos na borda esquerda.
          transformOrigin: 'left center',
          transform: [{ scaleX: level }],
        }}
      />
    </View>
  );
}

export const MicLevelBar = memo(MicLevelBarImpl);
