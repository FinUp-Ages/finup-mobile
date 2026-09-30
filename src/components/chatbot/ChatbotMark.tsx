import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, FeGaussianBlur, Filter, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

// Ajuste estes valores para calibrar a animacao padrao da aura.
const DEFAULT_PULSE_DURATION_MS = 12000;
const DEFAULT_FLAME_ROTATION_DURATION_MS = 28000;

interface ChatbotMarkProps {
  /** Intensidade do glow, de 0 (invisivel) a 1 (original). */
  glowOpacity?: number;
  /** Escala do glow em relacao ao container; preparada para o pulso futuro. */
  glowExpansion?: number;
  /** Duracao, em milissegundos, de um ciclo completo de respiracao. */
  pulseDuration?: number;
  /** Duracao, em milissegundos, de uma volta completa dos fluxos internos. */
  flameRotationDuration?: number;
  size?: number;
}

/** Marca usada na tela de boas-vindas, com aura azul orgânica inspirada em Hotflames. */
export function ChatbotMark({
  flameRotationDuration = DEFAULT_FLAME_ROTATION_DURATION_MS,
  glowExpansion = 1,
  glowOpacity = 1,
  pulseDuration = DEFAULT_PULSE_DURATION_MS,
  size = 100,
}: ChatbotMarkProps) {
  const sphereSize = size * 2.8 * Math.max(glowExpansion, 0.1);
  const glowCanvasSize = sphereSize * 3;
  const glowCanvasOffset = glowCanvasSize / 2;
  const [pulse] = useState(() => new Animated.Value(0));
  const [flameRotation] = useState(() => new Animated.Value(0));
  const minimumOpacity = Math.max(0, Math.min(glowOpacity * 0.62, 1));
  const maximumOpacity = Math.max(0, Math.min(glowOpacity, 1));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: pulseDuration / 2, toValue: 1, useNativeDriver: true }),
        Animated.timing(pulse, { duration: pulseDuration / 2, toValue: 0, useNativeDriver: true }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, pulseDuration]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(flameRotation, {
        duration: flameRotationDuration,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: false,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [flameRotation, flameRotationDuration]);

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.sphere,
          {
            height: glowCanvasSize,
            marginLeft: -glowCanvasOffset,
            marginTop: -glowCanvasOffset,
            width: glowCanvasSize,
          },
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [minimumOpacity, maximumOpacity] }),
            transform: [
              {
                scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.07] }),
              },
            ],
          },
        ]}
      >
        <Svg height="100%" style={styles.svg} viewBox="0 0 300 300" width="100%">
          <Defs>
            <RadialGradient cx="45%" cy="48%" id="chatbotSphereCore" rx="67%" ry="64%">
              <Stop offset="0%" stopColor="#76D4FF" stopOpacity="0.7" />
              <Stop offset="23%" stopColor="#24B0FF" stopOpacity="0.52" />
              <Stop offset="43%" stopColor="#078CFA" stopOpacity="0.28" />
              <Stop offset="59%" stopColor="#006BE4" stopOpacity="0.1" />
              <Stop offset="72%" stopColor="#0050B8" stopOpacity="0.025" />
              <Stop offset="82%" stopColor="#003A8F" stopOpacity="0.003" />
              <Stop offset="100%" stopColor="#00265F" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient cx="29%" cy="23%" id="chatbotSphereHighlight" rx="58%" ry="55%">
              <Stop offset="0%" stopColor="#E0F8FF" stopOpacity="0.74" />
              <Stop offset="20%" stopColor="#9BE5FF" stopOpacity="0.48" />
              <Stop offset="39%" stopColor="#35C5FF" stopOpacity="0.2" />
              <Stop offset="55%" stopColor="#0797FA" stopOpacity="0.055" />
              <Stop offset="68%" stopColor="#0073D1" stopOpacity="0.01" />
              <Stop offset="79%" stopColor="#0057A6" stopOpacity="0.001" />
              <Stop offset="100%" stopColor="#0073D1" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient cx="70%" cy="76%" id="chatbotSphereDepth" rx="60%" ry="58%">
              <Stop offset="0%" stopColor="#0050C7" stopOpacity="0.36" />
              <Stop offset="25%" stopColor="#006DE8" stopOpacity="0.22" />
              <Stop offset="44%" stopColor="#078EFF" stopOpacity="0.09" />
              <Stop offset="59%" stopColor="#149EFF" stopOpacity="0.025" />
              <Stop offset="72%" stopColor="#24B4FF" stopOpacity="0.005" />
              <Stop offset="81%" stopColor="#35C5FF" stopOpacity="0" />
              <Stop offset="100%" stopColor="#078EFF" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient cx="50%" cy="50%" id="chatbotSphereAura" rx="82%" ry="76%">
              <Stop offset="0%" stopColor="#1AB2FF" stopOpacity="0.22" />
              <Stop offset="29%" stopColor="#0099FF" stopOpacity="0.15" />
              <Stop offset="48%" stopColor="#007EEB" stopOpacity="0.07" />
              <Stop offset="63%" stopColor="#0067CC" stopOpacity="0.022" />
              <Stop offset="76%" stopColor="#0050A3" stopOpacity="0.004" />
              <Stop offset="85%" stopColor="#003C7B" stopOpacity="0" />
              <Stop offset="100%" stopColor="#0067CC" stopOpacity="0" />
            </RadialGradient>
            <Filter height="300%" id="chatbotSphereBlur" width="300%" x="-100%" y="-100%">
              <FeGaussianBlur stdDeviation="7" />
            </Filter>
          </Defs>
          <G filter="url(#chatbotSphereBlur)" transform="translate(100 100)">
            <Ellipse cx="50" cy="50" fill="url(#chatbotSphereAura)" rx="50" ry="48" />
            <Ellipse cx="49" cy="51" fill="url(#chatbotSphereCore)" rx="44" ry="41" />
            <Ellipse cx="48" cy="49" fill="url(#chatbotSphereHighlight)" rx="43" ry="40" />
            <Ellipse cx="52" cy="52" fill="url(#chatbotSphereDepth)" rx="43" ry="40" />
          </G>
        </Svg>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flameLayer,
            {
              transform: [
                {
                  rotate: flameRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }),
                },
              ],
            },
          ]}
        >
          <Svg height="100%" style={styles.svg} viewBox="0 0 300 300" width="100%">
            <Defs>
              <LinearGradient id="chatbotBlueFlameLeftMoving" x1="0%" x2="82%" y1="100%" y2="0%">
                <Stop offset="0%" stopColor="#006DDA" stopOpacity="0" />
                <Stop offset="21%" stopColor="#008FFF" stopOpacity="0.04" />
                <Stop offset="43%" stopColor="#0BB1FF" stopOpacity="0.2" />
                <Stop offset="64%" stopColor="#45D0FF" stopOpacity="0.38" />
                <Stop offset="78%" stopColor="#83E5FF" stopOpacity="0.27" />
                <Stop offset="91%" stopColor="#B7F3FF" stopOpacity="0.05" />
                <Stop offset="100%" stopColor="#D6FAFF" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id="chatbotBlueFlameRightMoving" x1="100%" x2="15%" y1="8%" y2="100%">
                <Stop offset="0%" stopColor="#B8F4FF" stopOpacity="0" />
                <Stop offset="19%" stopColor="#83E5FF" stopOpacity="0.04" />
                <Stop offset="39%" stopColor="#45D0FF" stopOpacity="0.21" />
                <Stop offset="61%" stopColor="#0DABFF" stopOpacity="0.35" />
                <Stop offset="78%" stopColor="#0088F5" stopOpacity="0.17" />
                <Stop offset="92%" stopColor="#0066C4" stopOpacity="0.03" />
                <Stop offset="100%" stopColor="#004A94" stopOpacity="0" />
              </LinearGradient>
              <Filter height="300%" id="chatbotBlueFlameMotionBlur" width="300%" x="-100%" y="-100%">
                <FeGaussianBlur stdDeviation="8" />
              </Filter>
            </Defs>
            <G filter="url(#chatbotBlueFlameMotionBlur)" transform="translate(100 100)">
              <Path
                d="M48 83C24 85 8 73 11 55c2-13 14-20 13-34 9 12 5 23 11 32 4 6 11 9 20 10-2 9-5 15-7 20Z"
                fill="url(#chatbotBlueFlameLeftMoving)"
              />
              <Path
                d="M57 23c16-9 29 0 32 13 3 14-7 22-4 35-10-10-19-9-26-2-5-13-5-29-2-46Z"
                fill="url(#chatbotBlueFlameRightMoving)"
              />
              <Path
                d="M19 38c7-15 22-19 33-13-9 7-10 16-5 25-11 1-21-2-28-12Z"
                fill="url(#chatbotBlueFlameLeftMoving)"
                opacity="0.72"
              />
              <Path
                d="M53 76c8-12 20-15 31-9-6 5-8 12-5 20-10 2-20-1-26-11Z"
                fill="url(#chatbotBlueFlameRightMoving)"
                opacity="0.68"
              />
            </G>
          </Svg>
        </Animated.View>
      </Animated.View>
      <Image
        accessible
        accessibilityLabel="FinUp"
        resizeMode="contain"
        source={require('../../../assets/logo-white.png')}
        style={[styles.logo, { height: size, marginLeft: -size / 2, marginTop: -size / 2, width: size }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'visible', width: '100%' },
  flameLayer: { ...StyleSheet.absoluteFill },
  logo: { flexShrink: 0, left: '50%', position: 'absolute', top: '40%' },
  sphere: { left: '50%', position: 'absolute', top: '40%' },
  svg: { overflow: 'visible' },
});
