import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
        placeholderTextColor={colors.chatText}
        returnKeyType="send"
        style={styles.input}
        submitBehavior="submit"
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

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
  },
  composer: {
    backgroundColor: colors.glass,
    borderRadius: 13,
    elevation: 5,
    minHeight: 92,
    shadowColor: '#000000',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  input: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 70,
    minHeight: 38,
    paddingHorizontal: 16,
    paddingTop: 14,
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
