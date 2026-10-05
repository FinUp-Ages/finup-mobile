import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import type { ChatMessage } from '@/types/chatbot';

interface ChatbotMessageProps {
  message: ChatMessage;
}

export function ChatbotMessage({ message }: ChatbotMessageProps) {
  const isUser = message.role === 'user';
  return (
    <View style={isUser ? styles.userRow : styles.assistantRow}>
      <View style={isUser ? styles.userBubble : styles.assistantBubble}>
        <Text style={isUser ? styles.userText : styles.assistantText}>{message.text}</Text>
        {message.status === 'error' ? <Text style={styles.errorText}>Mensagem não enviada</Text> : null}
        {message.action === 'REGISTER_TRANSACTION' ? <Text style={styles.actionText}>Transação registrada</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantBubble: { maxWidth: '96%' },
  assistantRow: { alignItems: 'flex-start', marginTop: 20 },
  assistantText: { color: colors.chatText, fontSize: 14, lineHeight: 19 },
  actionText: { color: colors.chatSuccess, fontSize: 12, fontWeight: '700', marginTop: 8 },
  errorText: { color: colors.chatErrorOnLight, fontSize: 12, marginTop: 6 },
  userBubble: { backgroundColor: colors.pillLight, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 12 },
  userRow: { alignItems: 'flex-end', marginTop: 14 },
  userText: { color: colors.chatUserText, fontSize: 14, lineHeight: 20 },
});
