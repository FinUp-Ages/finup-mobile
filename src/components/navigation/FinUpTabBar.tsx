import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tabs } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Keyboard,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useReportTabBarHeight } from '@/components/navigation/TabBarClearance';
import { Text } from '@/components/ui/AppText';
import { tabBarColors } from '@/theme/colors';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
type IconName = ComponentProps<typeof Ionicons>['name'];

/** Icone de contorno quando inativa e preenchido quando ativa, como nas abas do iOS. */
const TAB_ICONS: Record<string, { filled: IconName; outline: IconName }> = {
  analise: { filled: 'stats-chart', outline: 'stats-chart-outline' },
  carteira: { filled: 'wallet', outline: 'wallet-outline' },
  chatbot: { filled: 'chatbubble-ellipses', outline: 'chatbubble-ellipses-outline' },
  educacional: { filled: 'book', outline: 'book-outline' },
};

/** Aba central: acao principal do app, desenhada como orbe que sai da barra. */
const ACTION_ROUTE = 'transacao';

const BAR_HEIGHT = 64;
const BAR_RADIUS = BAR_HEIGHT / 2;
const SIDE_MARGIN = 16;
const BOTTOM_MARGIN = 12;
const ORB_SIZE = 52;
const ORB_PROTRUSION = 18;
/** Folga do conteudo dentro da capsula (a borda de luz ocupa 1) e da lente em cada aba. */
const BAR_PADDING = 6;
const LENS_INSET = 2;
const LENS_HEIGHT = BAR_HEIGHT - BAR_PADDING * 2 - 2;

/** Mola da lente e dos icones: rapida, com um leve overshoot. */
const SPRING = { damping: 14, mass: 0.8, stiffness: 190, useNativeDriver: true } as const;

/**
 * COMPONENT - barra de abas flutuante do FinUp, no estilo "liquid glass" da Apple.
 *
 * Capsula de vidro translucido que flutua por cima do conteudo (a cor da tela aparece por baixo),
 * com borda de luz em degrade, brilho especular no topo e reflexo azul na base. Cinco posicoes
 * iguais: o orbe de Transacao fica sempre no centro e sai para cima da barra; a aba ativa ganha
 * icone preenchido, rotulo azul e uma lente de vidro atras.
 *
 * Animacoes (todas no driver nativo): a lente desliza ate a aba ativa com mola e se estica no
 * caminho; o icone escolhido da um pulo; o orbe gira 90 graus ao tocar. Com "reduzir movimento"
 * ligado a lente so aparece na aba nova. O desfoque real do fundo exigiria o expo-blur (modulo
 * nativo, novo build): aqui o vidro e feito com tinta, brilho e borda. Some com o teclado aberto;
 * as telas reservam a altura dela (ver TabBarClearance).
 */
export function FinUpTabBar({ state, descriptors, emitter, navigateToTab, insets }: TabBarProps) {
  const reportHeight = useReportTabBarHeight();
  const keyboardVisible = useKeyboardVisible();
  const reduceMotion = useReduceMotion();
  const [barWidth, setBarWidth] = useState(0);
  const [lensX] = useState(() => new Animated.Value(0));
  const [lensOpacity] = useState(() => new Animated.Value(0));
  const [lensStretch] = useState(() => new Animated.Value(0));
  const [selected] = useState(() => state.routes.map(() => new Animated.Value(0)));
  const [orbSpin] = useState(() => new Animated.Value(0));

  const bottomOffset = Math.max(insets.bottom, BOTTOM_MARGIN);
  const overlayHeight = bottomOffset + BAR_HEIGHT + ORB_PROTRUSION;
  const slotWidth = (barWidth - BAR_PADDING * 2) / state.routes.length;
  const activeIsAction = state.routes[state.index]?.name === ACTION_ROUTE;

  useEffect(() => {
    reportHeight(keyboardVisible ? 0 : overlayHeight);
  }, [keyboardVisible, overlayHeight, reportHeight]);

  // Lente: desliza (e se estica) ate a aba ativa; some quando a ativa e o orbe.
  useEffect(() => {
    if (barWidth === 0) return;
    const toX = BAR_PADDING + state.index * slotWidth + LENS_INSET;
    const toOpacity = activeIsAction ? 0 : 1;
    if (reduceMotion) {
      lensX.setValue(toX);
      lensOpacity.setValue(toOpacity);
      return;
    }
    Animated.parallel([
      Animated.spring(lensX, { ...SPRING, toValue: toX }),
      Animated.timing(lensOpacity, { duration: 180, toValue: toOpacity, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(lensStretch, { duration: 110, toValue: 1, useNativeDriver: true }),
        Animated.spring(lensStretch, { ...SPRING, toValue: 0 }),
      ]),
    ]).start();
  }, [
    state.index,
    barWidth,
    slotWidth,
    activeIsAction,
    reduceMotion,
    lensX,
    lensOpacity,
    lensStretch,
  ]);

  // Icones: o escolhido cresce com um pequeno overshoot de mola.
  useEffect(() => {
    state.routes.forEach((_, index) => {
      const target = index === state.index ? 1 : 0;
      if (reduceMotion) selected[index].setValue(target);
      else Animated.spring(selected[index], { ...SPRING, toValue: target }).start();
    });
  }, [state.index, state.routes, selected, reduceMotion]);

  if (keyboardVisible) return null;

  const spin = orbSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const spinOrb = () => {
    if (reduceMotion) return;
    orbSpin.setValue(0);
    Animated.timing(orbSpin, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: bottomOffset, height: BAR_HEIGHT + ORB_PROTRUSION }]}
    >
      <LinearGradient
        colors={[tabBarColors.rimStart, tabBarColors.rimMiddle, tabBarColors.rimEnd]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.rim}
      >
        <View
          onLayout={(event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width)}
          style={styles.glass}
        >
          <LinearGradient
            colors={[tabBarColors.specularTop, tabBarColors.specularBottom]}
            pointerEvents="none"
            style={styles.specular}
          />
          <LinearGradient
            colors={['rgba(70, 150, 255, 0)', tabBarColors.glowBottom]}
            pointerEvents="none"
            style={styles.glow}
          />
          {barWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.lens,
                {
                  opacity: lensOpacity,
                  transform: [
                    { translateX: lensX },
                    {
                      scaleX: lensStretch.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.18],
                      }),
                    },
                    {
                      scaleY: lensStretch.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.92],
                      }),
                    },
                  ],
                  width: slotWidth - LENS_INSET * 2,
                },
              ]}
            >
              <LinearGradient
                colors={[tabBarColors.lensShine, 'rgba(255, 255, 255, 0)']}
                pointerEvents="none"
                style={styles.lensShine}
              />
            </Animated.View>
          ) : null}

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const focused = state.index === index;
              const label =
                typeof options.title === 'string' && options.title ? options.title : route.name;

              const onPress = () => {
                const event = emitter.emit({
                  canPreventDefault: true,
                  target: route.key,
                  type: 'tabPress',
                });
                if (!focused && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              };
              const onLongPress = () => {
                emitter.emit({ target: route.key, type: 'tabLongPress' });
              };

              const icons = TAB_ICONS[route.name];
              const isAction = route.name === ACTION_ROUTE;
              const iconScale = selected[index].interpolate({
                extrapolate: 'extend',
                inputRange: [0, 1],
                outputRange: [1, 1.12],
              });
              return (
                <Pressable
                  accessibilityLabel={label}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  key={route.key}
                  onLongPress={onLongPress}
                  onPress={() => {
                    if (isAction) spinOrb();
                    onPress();
                  }}
                  style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
                >
                  {isAction || !icons ? (
                    <View style={styles.iconSlot} />
                  ) : (
                    <Animated.View style={[styles.iconSlot, { transform: [{ scale: iconScale }] }]}>
                      <Ionicons
                        color={focused ? tabBarColors.active : tabBarColors.icon}
                        name={focused ? icons.filled : icons.outline}
                        size={25}
                      />
                    </Animated.View>
                  )}
                  <Text style={[styles.label, focused ? styles.labelActive : null]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </LinearGradient>

      {state.routes.map((route, index) =>
        route.name === ACTION_ROUTE ? (
          <ActionOrb
            key={route.key}
            label={descriptors[route.key].options.title ?? route.name}
            onLongPress={() => emitter.emit({ target: route.key, type: 'tabLongPress' })}
            onPress={() => {
              spinOrb();
              const event = emitter.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress',
              });
              if (state.index !== index && !event.defaultPrevented) navigateToTab(route.key);
            }}
            selected={state.index === index}
            spin={spin}
          />
        ) : null,
      )}
    </View>
  );
}

type ActionOrbProps = {
  label: string;
  onLongPress: () => void;
  onPress: () => void;
  selected: boolean;
  spin: Animated.AnimatedInterpolation<string>;
};

function ActionOrb({ label, onLongPress, onPress, selected, spin }: ActionOrbProps) {
  return (
    <View pointerEvents="box-none" style={styles.orbAnchor}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        onLongPress={onLongPress}
        onPress={onPress}
        style={({ pressed }) => [
          styles.orbShadow,
          selected ? styles.orbSelected : null,
          pressed ? styles.orbPressed : null,
        ]}
      >
        <View style={styles.orb}>
          <LinearGradient
            colors={[tabBarColors.orbTop, tabBarColors.orbBottom]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons color={tabBarColors.onAccent} name="add" size={30} />
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setEnabled(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return enabled;
}

const styles = StyleSheet.create({
  container: {
    left: SIDE_MARGIN,
    position: 'absolute',
    right: SIDE_MARGIN,
  },
  iconSlot: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  label: {
    color: tabBarColors.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelActive: {
    color: tabBarColors.active,
  },
  lens: {
    backgroundColor: tabBarColors.lensFill,
    borderColor: tabBarColors.lensBorder,
    borderRadius: LENS_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth * 2,
    height: LENS_HEIGHT,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: BAR_PADDING,
  },
  lensShine: {
    ...StyleSheet.absoluteFill,
    bottom: '50%',
  },
  orb: {
    alignItems: 'center',
    borderColor: tabBarColors.orbRing,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 4,
    height: ORB_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
    width: ORB_SIZE,
  },
  glass: {
    backgroundColor: tabBarColors.tint,
    borderRadius: BAR_RADIUS - 1,
    flex: 1,
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFill,
    top: '55%',
  },
  rim: {
    borderRadius: BAR_RADIUS,
    bottom: 0,
    height: BAR_HEIGHT,
    left: 0,
    padding: 1,
    position: 'absolute',
    right: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: BAR_PADDING,
  },
  specular: {
    ...StyleSheet.absoluteFill,
    bottom: '50%',
  },
  orbAnchor: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  orbPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  orbSelected: {
    shadowOpacity: 0.8,
    transform: [{ scale: 1.06 }],
  },
  orbShadow: {
    borderRadius: ORB_SIZE / 2,
    elevation: 8,
    shadowColor: tabBarColors.orbGlow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  pressed: {
    opacity: 0.6,
  },
});
