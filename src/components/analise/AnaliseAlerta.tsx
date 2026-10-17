import { useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { AlertIcon } from '@/components/ui/AlertIcon';
import { darkColors } from '@/theme/colors';

const ALERTA_MENSAGEM =
  'R$ 3.000,00 em apostas esse mês. Esse dinheiro guardado renderia R$ 4.831,53 em 5 anos guardando a 10% a.a. Tigrinho não é investimento.';

/** Conteúdo temporariamente estático até a equipe definir a origem e a regra do alerta. */
export function AnaliseAlerta() {
  const [expanded, setExpanded] = useState(false);
  const [expansion] = useState(() => new Animated.Value(0));
  const messageMargin = expansion.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });
  const messageMaxHeight = expansion.interpolate({ inputRange: [0, 1], outputRange: [0, 300] });

  function toggleExpanded() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    Animated.timing(expansion, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
      toValue: nextExpanded ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }

  return (
    <Pressable
      accessibilityHint={expanded ? 'Toque para recolher o alerta' : 'Toque para expandir o alerta'}
      accessibilityLabel={`Atenção sobre BETS. ${expanded ? ALERTA_MENSAGEM : ''}`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={toggleExpanded}
      style={({ pressed }) => [styles.alert, pressed ? styles.pressed : null]}
    >
      <View style={styles.header}>
        <View style={styles.title}>
          <View style={styles.iconContainer}>
            <AlertIcon />
          </View>
          <Text style={styles.titleText}>Atenção!</Text>
        </View>
        <Text style={styles.category}>BETS</Text>
      </View>
      <Animated.View
        style={[
          styles.messageContainer,
          { marginTop: messageMargin, maxHeight: messageMaxHeight, opacity: expansion },
        ]}
      >
        <Text style={styles.message}>{ALERTA_MENSAGEM}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  alert: {
    backgroundColor: darkColors.analiseAlert,
    borderColor: darkColors.analiseAlertBorder,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  category: {
    color: darkColors.analiseAlertText,
    fontSize: 14,
    fontWeight: '100',
    letterSpacing: 0.24,
  },
  header: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 0,
  },
  // Ajuste o scale para alterar somente o tamanho visual do SVG nesta tela.
  iconContainer: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    transform: [{ scale: 1.2 }],
    width: 20,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    letterSpacing: 0.24,
    lineHeight: 20,
  },
  messageContainer: { overflow: 'hidden' },
  pressed: { opacity: 0.8 },
  title: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  titleText: {
    color: darkColors.analiseAlertText,
    fontSize: 14,
    fontWeight: '100',
    letterSpacing: 0.24,
  },
});
