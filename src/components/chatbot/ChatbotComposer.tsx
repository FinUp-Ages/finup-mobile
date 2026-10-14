import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';

interface ChatbotComposerProps {
  dictationMessage: string | null;
  draft: string;
  isDictating: boolean;
  isSending: boolean;
  onCancelDictation: () => void;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
  onStartDictation: () => void;
  onStopDictation: () => void;
}

/** Segurar o microfone por este tempo troca o toque pelo modo "segurar para falar". */
const HOLD_TO_DICTATE_DELAY_MS = 300;

/**
 * Campo de mensagem do chatbot. Anexo fica de fora ate o back ter contrato para
 * ele. O microfone e ditado: a fala vira texto no proprio campo e o envio
 * continua manual. `submitBehavior="submit"` faz o "Enviar" do teclado enviar
 * mesmo com `multiline` (sem ele o iOS so quebra a linha).
 */
export function ChatbotComposer({
  dictationMessage,
  draft,
  isDictating,
  isSending,
  onCancelDictation,
  onChangeDraft,
  onSend,
  onStartDictation,
  onStopDictation,
}: ChatbotComposerProps) {
  /** Ditado iniciado por toque longo: soltar o dedo conclui a fala. */
  const isHolding = useRef(false);

  return (
    <View>
      {dictationMessage && !isDictating ? (
        <Text accessibilityLiveRegion="polite" style={styles.dictationMessage}>
          {dictationMessage}
        </Text>
      ) : null}
      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Digite sua mensagem"
          editable={!isDictating}
          maxLength={500}
          multiline
          onChangeText={onChangeDraft}
          onSubmitEditing={onSend}
          placeholder={isDictating ? 'Ouvindo...' : 'Digite sua mensagem'}
          placeholderTextColor={colors.placeholderOnDark}
          returnKeyType="send"
          style={styles.input}
          submitBehavior="submit"
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          value={draft}
        />
        <View style={styles.actions}>
          {isDictating ? (
            <Pressable
              accessibilityLabel="Cancelar ditado"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onCancelDictation}
              style={styles.cancelAction}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityHint="Toque para ditar e toque de novo para concluir, ou segure enquanto fala"
            accessibilityLabel={isDictating ? 'Concluir ditado' : 'Ditar mensagem'}
            accessibilityRole="button"
            accessibilityState={{ busy: isDictating }}
            delayLongPress={HOLD_TO_DICTATE_DELAY_MS}
            hitSlop={10}
            onLongPress={() => {
              if (isDictating) return;
              isHolding.current = true;
              onStartDictation();
            }}
            onPress={isDictating ? onStopDictation : onStartDictation}
            onPressOut={() => {
              if (!isHolding.current) return;
              isHolding.current = false;
              onStopDictation();
            }}
            style={[styles.micAction, isDictating ? styles.micActionActive : undefined]}
          >
            <Ionicons color={colors.white} name={isDictating ? 'mic' : 'mic-outline'} size={19} />
          </Pressable>
          <Pressable
            accessibilityLabel="Enviar mensagem"
            accessibilityRole="button"
            disabled={!draft.trim() || isSending || isDictating}
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
  cancelAction: { marginRight: 'auto' },
  cancelText: { color: colors.chatAccent, fontSize: 13, fontWeight: '700' },
  composer: {
    backgroundColor: colors.glassSoft,
    borderRadius: 12,
    gap: 24,
    padding: 16,
  },
  dictationMessage: { color: colors.errorOnDark, fontSize: 13, lineHeight: 19, marginBottom: 8 },
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
  sendAction: {
    alignItems: 'center',
    backgroundColor: colors.chatSendButton,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
});
