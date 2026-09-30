import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface ChatbotComposerProps {
  draft: string;
  isSending: boolean;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
}

export function ChatbotComposer({ draft, isSending, onChangeDraft, onSend }: ChatbotComposerProps) {
  return (
    <View style={styles.composer}>
      <TextInput
        accessibilityLabel="Digite sua mensagem"
        multiline
        onChangeText={onChangeDraft}
        onSubmitEditing={onSend}
        placeholder="Digite sua mensagem"
        placeholderTextColor="#C9D9E9"
        returnKeyType="send"
        style={styles.input}
        value={draft}
      />
      <View style={styles.actions}>
        <Pressable accessibilityLabel="Adicionar anexo" accessibilityRole="button" hitSlop={10} style={styles.leftAction}>
          <Ionicons color="#FFFFFF" name="add" size={25} />
        </Pressable>
        <View style={styles.rightActions}>
          <Pressable accessibilityLabel="Gravar mensagem de voz" accessibilityRole="button" hitSlop={10}>
            <Ionicons color="#FFFFFF" name="mic-outline" size={21} />
          </Pressable>
          <Pressable
            accessibilityLabel="Enviar mensagem"
            accessibilityRole="button"
            disabled={!draft.trim() || isSending}
            hitSlop={10}
            onPress={onSend}
            style={styles.sendAction}
          >
            {isSending ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons color="#FFFFFF" name="arrow-up" size={19} />}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
  },
  composer: {
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    borderRadius: 13,
    elevation: 5,
    minHeight: 92,
    shadowColor: '#000000',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 70,
    minHeight: 38,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  leftAction: { alignItems: 'center', height: 28, justifyContent: 'center', width: 20 },
  rightActions: { alignItems: 'center', flexDirection: 'row', gap: 21 },
  sendAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(135, 190, 226, 0.45)',
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
});
