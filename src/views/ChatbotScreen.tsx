import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-screens/experimental';
import { ChatbotComposer } from '@/components/chatbot/ChatbotComposer';
import { ChatbotHeader } from '@/components/chatbot/ChatbotHeader';
import { ChatbotMark } from '@/components/chatbot/ChatbotMark';
import { ChatbotMessage } from '@/components/chatbot/ChatbotMessage';
import { ChatbotSideMenu } from '@/components/chatbot/ChatbotSideMenu';
import { ChatbotWelcome } from '@/components/chatbot/ChatbotWelcome';
import { colors } from '@/theme/colors';
import { useChatbotViewModel } from '@/viewmodels/useChatbotViewModel';

const CHATBOT_MARK_SIZE = 100;
const COMPACT_CHATBOT_MARK_SIZE = 64;
const GRADIENT_COLORS = [
  colors.chatGradientTop,
  colors.chatGradientMiddle,
  colors.chatGradientLow,
  colors.chatGradientBottom,
] as const;

/**
 * VIEW - experiencia visual do chatbot e seus estados de teclado.
 *
 * Area central: carregando a conversa aberta pelo menu, erro ao abrir, mensagens
 * ou, sem conversa, as boas-vindas.
 */
export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const vm = useChatbotViewModel();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const hasConversation = vm.hasConversation;

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
    <LinearGradient colors={GRADIENT_COLORS} locations={[0, 0.48, 0.77, 1]} style={styles.screen}>
      <StatusBar style="light" />
      {/* Como na aba Transacao: o SafeAreaView do react-native-screens deixa o
          composer acima da barra de abas nativa (que flutua no iOS 26). */}
      <SafeAreaView edges={{ bottom: true }} style={styles.safeArea}>
        {/* `padding` tambem no Android: com o edge-to-edge a janela nao encolhe
            quando o teclado abre e o composer ficava atras dele. Se a janela
            encolher mesmo assim, o KAV recalcula pelo layout e a sobra vira 0. */}
        <KeyboardAvoidingView behavior="padding" style={styles.keyboard}>
          <View style={[styles.content, { paddingTop: insets.top + 13, paddingBottom: isKeyboardOpen ? 8 : 16 }]}>
            <ChatbotHeader onOpenMenu={() => vm.setIsMenuOpen(true)} showAssistantStatus={hasConversation} />

            {vm.isLoadingMessages ? (
              <View style={styles.centered}>
                <ActivityIndicator accessibilityLabel="Carregando conversa" color={colors.chatAccent} />
              </View>
            ) : vm.messagesError ? (
              <View style={styles.centered}>
                <Text accessibilityLiveRegion="polite" style={[styles.errorText, styles.centeredText]}>
                  {vm.messagesError}
                </Text>
                <Pressable accessibilityRole="button" onPress={vm.retryOpenConversation} style={styles.centeredRetry}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : hasConversation ? (
              <ScrollView
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.messages}
              >
                {vm.messages.map((message) => <ChatbotMessage key={message.id} message={message} />)}
                {vm.isSending ? <Text style={styles.typing}>FinUp está pensando...</Text> : null}
                {vm.errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text accessibilityLiveRegion="polite" style={styles.errorText}>{vm.errorMessage}</Text>
                    <Pressable accessibilityRole="button" onPress={vm.retryLastMessage} style={styles.retryButton}>
                      <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                  </View>
                ) : null}
              </ScrollView>
            ) : (
              <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
                <View style={styles.welcome}>
                  <ChatbotMark compact={isKeyboardOpen} size={isKeyboardOpen ? COMPACT_CHATBOT_MARK_SIZE : CHATBOT_MARK_SIZE} />
                  <View style={[styles.welcomeCopy, isKeyboardOpen ? styles.welcomeCopyKeyboardOpen : undefined]}>
                    <ChatbotWelcome profileName={vm.profileName} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}

            <ChatbotComposer draft={vm.draft} isSending={vm.isSending} onChangeDraft={vm.setDraft} onSend={vm.sendMessage} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <ChatbotSideMenu
        activeConversationId={vm.conversationId}
        conversations={vm.conversations}
        disabled={vm.isSending}
        error={vm.conversationsError}
        isLoading={vm.isLoadingConversations}
        onClose={() => vm.setIsMenuOpen(false)}
        onNewConversation={vm.newConversation}
        onRetry={vm.loadConversations}
        onSelectConversation={(id) => void vm.openConversation(id)}
        visible={vm.isMenuOpen}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  centeredRetry: { marginTop: 8 },
  centeredText: { textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },
  errorContainer: { marginTop: 16 },
  errorText: { color: colors.errorOnDark, fontSize: 13, lineHeight: 19 },
  keyboard: { flex: 1 },
  messages: { flex: 1, marginTop: 31 },
  messagesContent: { paddingBottom: 18 },
  retryButton: { alignSelf: 'flex-start', marginTop: 8 },
  retryText: { color: colors.chatAccent, fontSize: 13, fontWeight: '700' },
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  typing: { color: colors.chatText, fontSize: 13, marginTop: 16 },
  welcome: { flex: 1, position: 'relative' },
  welcomeCopy: { alignItems: 'center', left: 0, paddingTop: 10, position: 'absolute', right: 0, top: '50%', zIndex: 1 },
  welcomeCopyKeyboardOpen: { top: '38%' },
});
