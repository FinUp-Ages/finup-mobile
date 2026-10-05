import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { TextInput } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';

interface ChatbotComposerProps {
  draft: string;
  isSending: boolean;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
}

/**
 * Campo de mensagem do chatbot. Anexo e audio ficam de fora ate o back ter
 * contrato para eles. `submitBehavior="submit"` faz o "Enviar" do teclado
 * enviar mesmo com `multiline` (sem ele o iOS so quebra a linha).
 */
export function ChatbotComposer({ draft, isSending, onChangeDraft, onSend }: ChatbotComposerProps) {
  return (
    <View style={styles.composer}>
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
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Enviar mensagem"
          accessibilityRole="button"
          disabled={!draft.trim() || isSending}
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
  );
}

// Figma (Frame 84): padding 16, gap 24, raio 12, fundo branco 10%; texto 14/18 a 75%.
const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minHeight: 26,
  },
  composer: {
    backgroundColor: colors.glassSoft,
    borderRadius: 12,
    gap: 24,
    padding: 16,
  },
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
  sendAction: {
    alignItems: 'center',
    backgroundColor: colors.chatSendButton,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
});
