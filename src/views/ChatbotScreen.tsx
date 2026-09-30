import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatbotComposer } from '@/components/chatbot/ChatbotComposer';
import { ChatbotHeader } from '@/components/chatbot/ChatbotHeader';
import { ChatbotMark } from '@/components/chatbot/ChatbotMark';
import { ChatbotMessage } from '@/components/chatbot/ChatbotMessage';
import { ChatbotSideMenu } from '@/components/chatbot/ChatbotSideMenu';
import { ChatBotWelcome } from '@/components/chatbot/ChatBotWelcome';
import { useChatbotViewModel } from '@/viewmodels/useChatbotViewModel';

const CHATBOT_MARK_SIZE = 100;

/** VIEW - experiencia visual do chatbot; mensagens e menu ainda sao simulados. */
export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const vm = useChatbotViewModel();
  const hasConversation = vm.messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [vm.messages, vm.isSending]);

  return (
    <LinearGradient colors={['#031833', '#031D3F', '#084A79', '#1185BD']} locations={[0, 0.48, 0.77, 1]} style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.keyboard}>
        <View style={[styles.content, { paddingTop: insets.top + 13, paddingBottom: Math.max(insets.bottom + 14, 22) }]}>
          <ChatbotHeader onOpenMenu={() => vm.setIsMenuOpen(true)} showModel={hasConversation} />

          {hasConversation ? (
            <ScrollView
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              style={styles.messages}
            >
              {vm.messages.map((message) => <ChatbotMessage key={message.id} message={message} />)}
              {vm.isSending ? <Text style={styles.typing}>FinUp esta pensando...</Text> : null}
            </ScrollView>
          ) : (
            <View style={styles.welcome}>
              <ChatbotMark size={CHATBOT_MARK_SIZE} />
              <View style={[styles.welcomeCopy, { paddingTop: 10 }]}>
                <ChatBotWelcome profileName={vm.profileName} />
              </View>
            </View>
          )}

          <ChatbotComposer draft={vm.draft} isSending={vm.isSending} onChangeDraft={vm.setDraft} onSend={vm.sendMessage} />
        </View>
      </KeyboardAvoidingView>
      <ChatbotSideMenu onClose={() => vm.setIsMenuOpen(false)} visible={vm.isMenuOpen} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 16 },
  keyboard: { flex: 1 },
  messages: { flex: 1, marginTop: 31 },
  messagesContent: { paddingBottom: 18 },
  screen: { flex: 1 },
  typing: { color: '#BBD1E2', fontSize: 13, marginTop: 16 },
  welcome: { flex: 1, position: 'relative' },
  welcomeCopy: { alignItems: 'center', left: 0, position: 'absolute', right: 0, top: '50%', zIndex: 1 },
});
