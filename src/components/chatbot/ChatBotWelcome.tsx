import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface ChatBotWelcomeProps {
  profileName: string | null;
}

/** Textos exibidos na abertura da conversa com o assistente. */
export function ChatBotWelcome({ profileName }: ChatBotWelcomeProps) {
  return (
    <>
      <Text style={styles.greeting}>Olá{profileName ? `, ${profileName}` : ''}!</Text>
      <Text style={styles.question}>Com o que posso{`\n`}ajudar você hoje?</Text>
    </>
  );
}

const styles = StyleSheet.create({
  greeting: { color: '#C6D8E6', fontSize: 14, marginTop: 63 },
  question: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', lineHeight: 31, marginTop: 20, textAlign: 'center' },
});
