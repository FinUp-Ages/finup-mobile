import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { colors } from '@/theme/colors';
import type { ChatMessage } from '@/types/chatbot';

interface ChatbotMessageProps {
  message: ChatMessage;
}

const markdownParser = MarkdownIt({ breaks: true, typographer: false });

export function ChatbotMessage({ message }: ChatbotMessageProps) {
  const isUser = message.role === 'user';
  return (
    <View style={isUser ? styles.userRow : styles.assistantRow}>
      <View style={isUser ? styles.userBubble : styles.assistantBubble}>
        {isUser ? (
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
});

const markdownStyles = StyleSheet.create({
  body: { color: colors.chatText, fontSize: 14, lineHeight: 19 },
  paragraph: { marginTop: 0, marginBottom: 8 },
  strong: { fontWeight: '700' },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  list_item: { marginBottom: 4 },
  bullet_list_icon: { color: colors.chatText, fontSize: 14, lineHeight: 19 },
  ordered_list_icon: { color: colors.chatText, fontSize: 14, lineHeight: 19 },
});
