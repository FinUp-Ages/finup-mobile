import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';

interface ChatbotWelcomeProps {
  profileName: string | null;
}

/** Textos exibidos na abertura da conversa com o assistente. */
export function ChatbotWelcome({ profileName }: ChatbotWelcomeProps) {
  return (
    <>
      <Text style={styles.greeting}>Olá{profileName ? `, ${profileName}` : ''}!</Text>
      <Text style={styles.question}>Com o que posso{`\n`}ajudar você hoje?</Text>
    </>
  );
}

const styles = StyleSheet.create({
  greeting: { color: colors.chatText, fontSize: 14, marginTop: 63 },
  question: { color: colors.white, fontSize: 24, fontWeight: '700', lineHeight: 31, marginTop: 20, textAlign: 'center' },
});
