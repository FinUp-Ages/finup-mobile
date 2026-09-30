import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatbotComposer } from '@/components/chatbot/ChatbotComposer';
import { ChatbotHeader } from '@/components/chatbot/ChatbotHeader';
import { ChatbotMark } from '@/components/chatbot/ChatbotMark';
import { ChatbotMessage } from '@/components/chatbot/ChatbotMessage';
import { ChatbotSideMenu } from '@/components/chatbot/ChatbotSideMenu';
import { ChatBotWelcome } from '@/components/chatbot/ChatBotWelcome';
import { useChatbotViewModel } from '@/viewmodels/useChatbotViewModel';

const CHATBOT_MARK_SIZE = 100;
const COMPACT_CHATBOT_MARK_SIZE = 64;

/** VIEW - experiencia visual do chatbot e seus estados de teclado. */
export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const vm = useChatbotViewModel();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const hasConversation = vm.messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [vm.messages, vm.isSending]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardOpen(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardOpen(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <LinearGradient colors={['#031833', '#031D3F', '#084A79', '#1185BD']} locations={[0, 0.48, 0.77, 1]} style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.keyboard}>
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 13, paddingBottom: isKeyboardOpen ? 12 : Math.max(insets.bottom + 20, 10) },
          ]}
        >
          <ChatbotHeader onOpenMenu={() => vm.setIsMenuOpen(true)} showAssistantStatus={hasConversation} />

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
              {vm.errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text accessibilityLiveRegion="polite" style={styles.errorText}>{vm.errorMessage}</Text>
                  <Pressable accessibilityRole="button" onPress={vm.sendMessage} style={styles.retryButton}>
                    <Text style={styles.retryText}>Tentar novamente</Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          ) : (
            <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
              <View style={styles.welcome}>
                <ChatbotMark compact={isKeyboardOpen} size={isKeyboardOpen ? COMPACT_CHATBOT_MARK_SIZE : CHATBOT_MARK_SIZE} />
                <View
                  style={[styles.welcomeCopy, isKeyboardOpen ? styles.welcomeCopyKeyboardOpen : undefined, { paddingTop: 10 }]}
                >
                  <ChatBotWelcome profileName={vm.profileName} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          <ChatbotComposer draft={vm.draft} isSending={vm.isSending} onChangeDraft={vm.setDraft} onSend={vm.sendMessage} />
        </View>
      </KeyboardAvoidingView>
      <ChatbotSideMenu
        conversations={vm.conversations}
        error={vm.conversationsError}
        isLoading={vm.isLoadingConversations}
        onClose={() => vm.setIsMenuOpen(false)}
        onRetry={vm.loadConversations}
        visible={vm.isMenuOpen}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 16 },
  errorContainer: { marginTop: 16 },
  errorText: { color: '#FFD0D0', fontSize: 13, lineHeight: 19 },
  keyboard: { flex: 1 },
  messages: { flex: 1, marginTop: 31 },
  messagesContent: { paddingBottom: 18 },
  retryButton: { alignSelf: 'flex-start', marginTop: 8 },
  retryText: { color: '#9CDBFF', fontSize: 13, fontWeight: '700' },
  screen: { flex: 1 },
  typing: { color: '#BBD1E2', fontSize: 13, marginTop: 16 },
  welcome: { flex: 1, position: 'relative' },
  welcomeCopy: { alignItems: 'center', left: 0, position: 'absolute', right: 0, top: '50%', zIndex: 1 },
  welcomeCopyKeyboardOpen: { top: '38%' },
});
