import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import React, { useEffect, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

/**
 * Barra de abas "liquid glass" so para o Android (usada na apresentacao aos
 * clientes). No iOS 26 o NativeTabs ja desenha o vidro nativo; no Android o
 * NativeTabs cai no Material 3 (cinza chapado), entao aqui o vidro e simulado:
 * capsula flutuante, preenchimento translucido, brilho diagonal, aro de luz
 * na borda e uma capsula de vidro mais clara na aba ativa.
 *
 * So usa View + expo-linear-gradient (ja linkado no app): nao exige modulo
 * nativo novo nem rebuild. Nao ha blur real (o Android nao tem o backdrop
 * filter do iOS), mas o fundo das telas e escuro e liso, entao o efeito de
 * vidro vem do brilho e do aro, como no iOS.
 */

type TabItem = {
  name: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

const ITEMS: TabItem[] = [
  { name: 'carteira', label: 'Carteira', icon: 'monetization-on' },
  { name: 'analise', label: 'Análise', icon: 'bar-chart' },
  { name: 'transacao', label: 'Transação', icon: 'add-circle' },
  { name: 'educacional', label: 'Educacional', icon: 'menu-book' },
  { name: 'chatbot', label: 'Chatbot', icon: 'person' },
];

const INACTIVE = 'rgba(255, 255, 255, 0.72)';
const RIM_LIGHT = 'rgba(255, 255, 255, 0.34)';

type GlassTabItemProps = TabTriggerSlotProps & { item: TabItem };

function GlassTabItem({ item, isFocused, ...pressableProps }: GlassTabItemProps) {
  const [focus] = useState(() => new Animated.Value(isFocused ? 1 : 0));

  useEffect(() => {
    Animated.timing(focus, {
      toValue: isFocused ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [focus, isFocused]);

  const scale = focus.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: !!isFocused }}
      android_ripple={null}
      style={styles.item}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.activeCapsule, { opacity: focus, transform: [{ scale }] }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.18)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <MaterialIcons name={item.icon} size={24} color={isFocused ? colors.tabActive : INACTIVE} />
      <Text
        numberOfLines={1}
        style={[styles.label, { color: isFocused ? colors.tabActive : INACTIVE }]}
      >
        {item.label}
      </Text>
    </Pressable>
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

function GlassBar() {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  // Com o teclado aberto (chat, valor da transacao) a barra some, como nas abas nativas.
  if (keyboardVisible && Platform.OS === 'android') return null;

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) + 4 }]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        {/* Corpo do vidro: preenchimento + brilho diagonal */}
        <View style={[StyleSheet.absoluteFill, styles.fill]} />
        <LinearGradient
          colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.05)', 'rgba(120,190,255,0.12)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Faixa de luz no topo, como o reflexo do vidro */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topHighlight}
        />
        <TabList style={styles.list}>
          {ITEMS.map((item) => (
            <TabTrigger key={item.name} name={item.name} href={`/${item.name}`} asChild>
              <GlassTabItem item={item} />
            </TabTrigger>
          ))}
        </TabList>
        {/* Aro de luz sobre tudo */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.rim]} />
      </View>
    </View>
  );
}

export function GlassTabs() {
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <GlassBar />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBackground },
  slot: { flex: 1 },
  wrapper: { paddingHorizontal: 18, paddingTop: 8, backgroundColor: colors.screenBackground },
  pill: {
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: { backgroundColor: 'rgba(255, 255, 255, 0.10)' },
  topHighlight: { position: 'absolute', top: 0, left: 24, right: 24, height: 1.5 },
  rim: { borderRadius: 35, borderWidth: 1, borderColor: RIM_LIGHT },
  list: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, height: '100%' },
  item: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeCapsule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  label: { fontSize: 10.5, fontWeight: '600', marginTop: 2 },
});
