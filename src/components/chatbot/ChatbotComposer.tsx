import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import type { VoiceStatus } from '@/types/chatbot';
import { formatDuration } from '@/utils/format';

interface ChatbotComposerProps {
  draft: string;
  isSending: boolean;
  onCancelVoice: () => void;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  voiceDisabled: boolean;
  voiceMessage: string | null;
  voiceStartedAt: number | null;
  voiceStatus: VoiceStatus;
}

/** Segurar o microfone por este tempo comeca a gravar; antes disso e um toque. */
const HOLD_TO_RECORD_DELAY_MS = 200;
/** Arrastar o dedo para a esquerda por esta distancia cancela a gravacao. */
const SLIDE_TO_CANCEL_DISTANCE = 80;
const HOLD_HINT = 'Segure o microfone para gravar e solte para enviar.';
const HOLD_HINT_DURATION_MS = 2500;

interface HoldHandlers {
  onCancel: () => void;
  onStart: () => void;
  onStop: () => void;
  onTap: () => void;
}

/**
 * Gesto do microfone, como no WhatsApp: segurar grava, soltar envia, arrastar
 * para a esquerda cancela e um toque curto so mostra a dica.
 *
 * PanResponder em vez de Pressable porque o Pressable nao informa o movimento do
 * dedo. Recriar o responder no meio do gesto perderia o estado dele, entao os
 * callbacks precisam ser estaveis (os do ViewModel sao `useCallback` sem deps).
 */
function createHoldToRecord({ onCancel, onStart, onStop, onTap }: HoldHandlers) {
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let recording = false;
  let cancelled = false;

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    // A lista de mensagens nao rouba o gesto enquanto o dedo esta no microfone.
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      recording = false;
      cancelled = false;
      holdTimer = setTimeout(() => {
        holdTimer = null;
        recording = true;
        onStart();
      }, HOLD_TO_RECORD_DELAY_MS);
    },
    onPanResponderMove: (_, gesture) => {
      if (!recording || cancelled || gesture.dx > -SLIDE_TO_CANCEL_DISTANCE) return;
      cancelled = true;
      onCancel();
    },
    onPanResponderRelease: () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
        onTap();
        return;
      }
      if (recording && !cancelled) onStop();
      recording = false;
    },
    // O sistema tirou o gesto (ex.: dialogo de permissao do microfone).
    onPanResponderTerminate: () => {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
      if (recording && !cancelled) onCancel();
      recording = false;
    },
  }).panHandlers;
}

function useHoldToRecord({ onCancel, onStart, onStop, onTap }: HoldHandlers) {
  return useMemo(() => createHoldToRecord({ onCancel, onStart, onStop, onTap }), [onCancel, onStart, onStop, onTap]);
}

/** Ponto vermelho piscando e tempo de gravacao, no lugar do campo de texto. */
function RecordingIndicator({ startedAt }: { startedAt: number }) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [blink] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { duration: 500, toValue: 0.2, useNativeDriver: true }),
        Animated.timing(blink, { duration: 500, toValue: 1, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  return (
    <View accessibilityLabel={`Gravando áudio, ${formatDuration(elapsedMs)}`} accessible style={styles.recording}>
      <Animated.View style={[styles.recordingDot, { opacity: blink }]} />
      <Text style={styles.recordingTime}>{formatDuration(elapsedMs)}</Text>
      <View style={styles.slideHint}>
        <Ionicons color={colors.placeholderOnDark} name="chevron-back" size={14} />
        <Text style={styles.slideHintText}>Deslize para cancelar</Text>
      </View>
    </View>
  );
}

/**
 * Campo de mensagem do chatbot. Anexo fica de fora ate o back ter contrato para
 * ele. O microfone envia mensagem de voz: segurar grava (o campo vira o
 * indicador de gravacao) e soltar envia a transcricao, sem mostra-la antes.
 * `submitBehavior="submit"` faz o "Enviar" do teclado enviar mesmo com
 * `multiline` (sem ele o iOS so quebra a linha).
 */
export function ChatbotComposer({
  draft,
  isSending,
  onCancelVoice,
  onChangeDraft,
  onSend,
  onStartVoice,
  onStopVoice,
  voiceDisabled,
  voiceMessage,
  voiceStartedAt,
  voiceStatus,
}: ChatbotComposerProps) {
  const [showHoldHint, setShowHoldHint] = useState(false);
  const isRecording = voiceStatus === 'recording' && voiceStartedAt !== null;
  const isProcessing = voiceStatus === 'processing';
  const isVoiceActive = voiceStatus !== 'idle';

  useEffect(() => {
    if (!showHoldHint) return;
    const timer = setTimeout(() => setShowHoldHint(false), HOLD_HINT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showHoldHint]);

  const micHandlers = useHoldToRecord({
    onCancel: onCancelVoice,
    onStart: onStartVoice,
    onStop: onStopVoice,
    onTap: useCallback(() => setShowHoldHint(true), []),
  });

  const notice = isVoiceActive ? null : showHoldHint ? HOLD_HINT : voiceMessage;

  return (
    <View>
      {notice ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.notice, showHoldHint ? styles.noticeHint : styles.noticeError]}
        >
          {notice}
        </Text>
      ) : null}
      <View style={styles.composer}>
        {isRecording ? (
          <RecordingIndicator startedAt={voiceStartedAt} />
        ) : isProcessing ? (
          <View accessibilityLiveRegion="polite" style={styles.recording}>
            <ActivityIndicator color={colors.white} size="small" />
            <Text style={styles.processingText}>Enviando áudio...</Text>
          </View>
        ) : (
          <TextInput
            accessibilityLabel="Digite sua mensagem"
            maxLength={500}
            multiline
            onChangeText={onChangeDraft}
            onSubmitEditing={onSend}
            placeholder="Digite sua mensagem"
            placeholderTextColor={colors.placeholderOnDark}
            returnKeyType="send"
            style={styles.input}
            submitBehavior="submit"
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            value={draft}
          />
        )}
        <View style={styles.actions}>
          <View
            {...micHandlers}
            accessibilityHint="Segure para gravar, solte para enviar e deslize para a esquerda para cancelar"
            accessibilityLabel="Gravar mensagem de voz"
            accessibilityRole="button"
            accessibilityState={{ busy: isVoiceActive, disabled: voiceDisabled }}
            hitSlop={10}
            // Desabilitado: o microfone nao recebe o toque (envio em andamento).
            pointerEvents={voiceDisabled ? 'none' : 'auto'}
            style={[
              styles.micAction,
              isVoiceActive ? styles.micActionActive : undefined,
              voiceDisabled ? styles.disabled : undefined,
            ]}
          >
            <Ionicons color={colors.white} name={isVoiceActive ? 'mic' : 'mic-outline'} size={19} />
          </View>
          <Pressable
            accessibilityLabel="Enviar mensagem"
            accessibilityRole="button"
            disabled={!draft.trim() || isSending || isVoiceActive}
            hitSlop={10}
            onPress={onSend}
            style={styles.sendAction}
          >
            {isSending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Ionicons color={colors.white} name="arrow-up" size={19} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// Figma (Frame 84): padding 16, gap 24, raio 12, fundo branco 10%; texto 14/18 a 75%.
const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'flex-end',
    minHeight: 26,
  },
  composer: {
    backgroundColor: colors.glassSoft,
    borderRadius: 12,
    gap: 24,
    padding: 16,
  },
  disabled: { opacity: 0.5 },
  input: {
    backgroundColor: 'transparent',
    color: colors.white,
    fontSize: 14,
    includeFontPadding: false,
    lineHeight: 18,
    maxHeight: 72,
    minHeight: 18,
    padding: 0,
  },
  // Mesmo tamanho do botao de envio, para a linha de acoes manter os 26px do Figma.
  micAction: { alignItems: 'center', borderRadius: 13, height: 26, justifyContent: 'center', width: 26 },
  micActionActive: { backgroundColor: colors.chatSendButton },
  notice: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  noticeError: { color: colors.errorOnDark },
  noticeHint: { color: colors.chatText },
  processingText: { color: colors.white, fontSize: 14, lineHeight: 18 },
  recording: { alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 18 },
  recordingDot: { backgroundColor: colors.error, borderRadius: 5, height: 10, width: 10 },
  recordingTime: { color: colors.white, fontSize: 14, fontVariant: ['tabular-nums'], lineHeight: 18 },
  sendAction: {
    alignItems: 'center',
    backgroundColor: colors.chatSendButton,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  slideHint: { alignItems: 'center', flexDirection: 'row', gap: 2, marginLeft: 'auto' },
  slideHintText: { color: colors.placeholderOnDark, fontSize: 13, lineHeight: 18 },
});
