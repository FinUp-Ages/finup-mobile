import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Markdown, { MarkdownIt } from '@ronradtke/react-native-markdown-display';
import { Text } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { interFamilyFor } from '@/theme/fonts';
import type { ChatMessage, VoiceRecording } from '@/types/chatbot';

interface ChatbotMessageProps {
  message: ChatMessage;
}

const markdownParser = MarkdownIt({ breaks: true, typographer: false }).disable(['link', 'image', 'autolink']);

/** Altura maxima de uma barra da forma de onda, em px. */
const WAVEFORM_HEIGHT = 22;
const WAVE_BAR_WIDTH = 3;
const WAVE_BAR_GAP = 3;
/** Transicao inteira: onda de leitura, desfoque da forma de onda e o texto saindo do desfoque. */
const TRANSITION_MS = 1200;
/** Desfoque maximo no meio da transicao, em px. */
const MAX_BLUR = 10;

/** Pega `count` barras espalhadas pela forma de onda gravada. */
function sampleLevels(levels: number[], count: number): number[] {
  if (count <= 0 || levels.length === 0) return [];
  return Array.from({ length: count }, (_, index) => levels[Math.floor((index * levels.length) / count)] ?? 0);
}

/**
 * Mensagem enviada por voz: a forma de onda captada se desfaz num desfoque e o
 * texto transcrito sai dele. O balao ja nasce no tamanho do texto final; a forma
 * de onda fica por cima dele. No fim e uma mensagem de texto comum: nada sugere
 * que o audio pode ser ouvido, porque ele nao e guardado.
 *
 * Tudo sai de um unico `progress` (0 a 1) no driver nativo:
 *   0.00-0.45 uma onda de leitura percorre as barras;
 *   0.25-0.55 a forma de onda desfoca e some;
 *   0.45-1.00 o texto aparece desfocado e entra em foco.
 * O `filter: blur` vale no Android 12+; no iOS (flag de filtros do RN desligada
 * por padrao) e no Android antigo a transicao fica so no esmaecer.
 *
 * So anima ao ser montada (mensagem recem-enviada); a transcricao ja esta pronta
 * e o envio nao espera a animacao.
 */
function VoiceTranscriptText({ text, voice }: { text: string; voice: VoiceRecording }) {
  const [barCount, setBarCount] = useState(0);
  const [showWaveform, setShowWaveform] = useState(true);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    const animation = Animated.timing(progress, {
      duration: TRANSITION_MS,
      easing: Easing.inOut(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });

    void AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (cancelled) return;
        if (reduceMotion) {
          progress.setValue(1);
          setShowWaveform(false);
          return;
        }
        animation.start(({ finished }) => {
          if (finished) setShowWaveform(false);
        });
      });

    return () => {
      cancelled = true;
      animation.stop();
    };
  }, [progress]);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setBarCount(Math.max(4, Math.floor((width + WAVE_BAR_GAP) / (WAVE_BAR_WIDTH + WAVE_BAR_GAP))));
  };

  const bars = sampleLevels(voice.levels, barCount);
  const waveformStyle = {
    filter: [{ blur: progress.interpolate({ extrapolate: 'clamp', inputRange: [0.25, 0.55], outputRange: [0, MAX_BLUR] }) }],
    opacity: progress.interpolate({ extrapolate: 'clamp', inputRange: [0.25, 0.55], outputRange: [1, 0] }),
  };
  const textStyle = {
    filter: [{ blur: progress.interpolate({ extrapolate: 'clamp', inputRange: [0.45, 1], outputRange: [MAX_BLUR, 0] }) }],
    opacity: progress.interpolate({ extrapolate: 'clamp', inputRange: [0.45, 0.8], outputRange: [0, 1] }),
    transform: [{ scale: progress.interpolate({ extrapolate: 'clamp', inputRange: [0.45, 1], outputRange: [0.96, 1] }) }],
  };

  return (
    <View onLayout={onLayout}>
      <Animated.View style={textStyle}>
        <Text style={styles.userText}>{text}</Text>
      </Animated.View>
      {showWaveform ? (
        <Animated.View pointerEvents="none" style={[styles.waveform, waveformStyle]}>
          {bars.map((level, index) => {
            // Destaque que anda da esquerda para a direita no comeco da transicao.
            const at = bars.length > 1 ? (index / (bars.length - 1)) * 0.45 : 0;
            const scaleY = progress.interpolate({
              extrapolate: 'clamp',
              inputRange: [at - 0.08, at, at + 0.08],
              outputRange: [1, 1.7, 1],
            });
            return (
              <Animated.View
                key={index}
                style={[styles.waveBar, { height: Math.max(3, level * WAVEFORM_HEIGHT), transform: [{ scaleY }] }]}
              />
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

export function ChatbotMessage({ message }: ChatbotMessageProps) {
  const isUser = message.role === 'user';
  const voice = isUser ? message.voice : undefined;

  return (
    <View style={isUser ? styles.userRow : styles.assistantRow}>
      <View style={isUser ? styles.userBubble : styles.assistantBubble}>
        {voice ? (
          <VoiceTranscriptText text={message.text} voice={voice} />
        ) : isUser ? (
          <Text style={styles.userText}>{message.text}</Text>
        ) : (
          <Markdown markdownit={markdownParser} style={markdownStyles}>{message.text}</Markdown>
        )}
        {message.status === 'error' ? <Text style={styles.errorText}>Mensagem não enviada</Text> : null}
        {message.action === 'REGISTER_TRANSACTION' ? <Text style={styles.actionText}>Transação registrada</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantBubble: { maxWidth: '96%' },
  assistantRow: { alignItems: 'flex-start', marginTop: 20 },
  actionText: { color: colors.chatSuccess, fontSize: 12, fontWeight: '700', marginTop: 8 },
  errorText: { color: colors.chatErrorOnLight, fontSize: 12, marginTop: 6 },
  userBubble: { backgroundColor: colors.pillLight, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 12 },
  userRow: { alignItems: 'flex-end', marginTop: 14 },
  userText: { color: colors.chatUserText, fontSize: 14, lineHeight: 20 },
  waveBar: { backgroundColor: colors.chatUserText, borderRadius: 1.5, opacity: 0.6, width: WAVE_BAR_WIDTH },
  waveform: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    gap: WAVE_BAR_GAP,
    justifyContent: 'center',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

const markdownStyles = StyleSheet.create({
  body: { color: colors.chatText, fontFamily: interFamilyFor('400'), fontSize: 14, lineHeight: 19 },
  paragraph: { marginTop: 0, marginBottom: 8 },
  strong: { fontFamily: interFamilyFor('700'), fontWeight: 'normal' },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  list_item: { marginBottom: 4 },
  bullet_list_icon: { color: colors.chatText, fontSize: 14, lineHeight: 19 },
  ordered_list_icon: { color: colors.chatText, fontSize: 14, lineHeight: 19 },
});
