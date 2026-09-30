import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantBubble: { maxWidth: '96%' },
  assistantRow: { alignItems: 'flex-start', marginTop: 20 },
  assistantText: { color: '#C5D3E1', fontSize: 14, lineHeight: 19 },
  userBubble: { backgroundColor: '#F8F8F9', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 12 },
  userRow: { alignItems: 'flex-end' },
  userText: { color: '#0F2849', fontSize: 14, lineHeight: 20 },
});
