import { Animated, StyleSheet, View } from 'react-native';

/**
 * COMPONENT - barra de nivel do microfone.
 *
 * A amplitude entra como `Animated.Value` e sai em `transform`: nenhuma
 * re-renderizacao por amostra de volume.
 */
interface MicLevelBarProps {
  /** Amplitude 0..1 do microfone, ja animada pelo ViewModel. */
  level: Animated.Value;
  active: boolean;
}

export function MicLevelBar({ level, active }: MicLevelBarProps) {
  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: active ? '#059669' : '#cbd5e1' },
          { transform: [{ scaleX: level }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    // scaleX cresce a partir do centro; ancoramos na borda esquerda.
    transformOrigin: 'left center',
  },
  track: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
});
