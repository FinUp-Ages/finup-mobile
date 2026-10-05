import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import type { ConversationSummary } from '@/types/chatbot';

interface ChatbotSideMenuProps {
  activeConversationId: string | null;
  conversations: ConversationSummary[];
  /** Enquanto uma mensagem e enviada nao da para trocar de conversa. */
  disabled: boolean;
  error: string | null;
  isLoading: boolean;
  visible: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  onRetry: () => void;
  onSelectConversation: (id: string) => void;
}

/** Historico de conversas do assistente: abre uma conversa ou comeca outra. */
export function ChatbotSideMenu({
  activeConversationId,
  conversations,
  disabled,
  error,
  isLoading,
  visible,
  onClose,
  onNewConversation,
  onRetry,
  onSelectConversation,
}: ChatbotSideMenuProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Fechar menu" onPress={onClose} style={styles.backdrop} />
        <View style={styles.drawer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>FinUp</Text>
            <Pressable accessibilityLabel="Fechar menu" accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <Ionicons color={colors.chatTextBright} name="close" size={25} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onNewConversation}
            style={[styles.newConversation, disabled ? styles.disabled : undefined]}
          >
            <Ionicons color={colors.white} name="create-outline" size={20} />
            <Text style={styles.newConversationText}>Nova conversa</Text>
          </Pressable>

          <Text style={styles.section}>CONVERSAS</Text>
          {isLoading && conversations.length === 0 ? <ActivityIndicator color={colors.chatAccent} style={styles.loading} /> : null}
          {error ? (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : null}
          {!isLoading && !error && conversations.length === 0 ? <Text style={styles.hint}>Nenhuma conversa ainda.</Text> : null}

          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} style={styles.list}>
            {conversations.map((conversation) => {
              const active = conversation.id === activeConversationId;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled, selected: active }}
                  disabled={disabled}
                  key={conversation.id}
                  onPress={() => onSelectConversation(conversation.id)}
                  style={[styles.item, active ? styles.itemActive : undefined, disabled ? styles.disabled : undefined]}
                >
                  <Ionicons color={colors.chatAccent} name="chatbubble-ellipses-outline" size={20} />
                  <Text numberOfLines={1} style={styles.itemText}>{conversation.title || 'Conversa sem título'}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  disabled: { opacity: 0.5 },
  drawer: { backgroundColor: colors.chatDrawer, bottom: 0, left: 0, padding: 28, paddingTop: 62, position: 'absolute', top: 0, width: '78%' },
  feedback: { marginTop: 13 },
  feedbackText: { color: colors.chatTextBright, fontSize: 13, lineHeight: 19 },
  hint: { color: colors.chatTextMuted, fontSize: 13, marginTop: 13 },
  item: { alignItems: 'center', backgroundColor: colors.chatDrawerItem, borderRadius: 11, flexDirection: 'row', gap: 12, marginTop: 13, padding: 14 },
  itemActive: { borderColor: colors.chatAccent, borderWidth: 1 },
  itemText: { color: colors.chatTextBright, flex: 1, fontSize: 14 },
  list: { flex: 1 },
  listContent: { paddingBottom: 28 },
  loading: { marginTop: 20 },
  newConversation: {
    alignItems: 'center',
    backgroundColor: colors.chatSendButton,
    borderRadius: 11,
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
    padding: 14,
  },
  newConversationText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  overlay: { backgroundColor: colors.chatOverlay, flex: 1 },
  section: { color: colors.chatTextMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.1, marginTop: 28 },
  retryButton: { alignSelf: 'flex-start', marginTop: 9 },
  retryText: { color: colors.chatAccent, fontSize: 13, fontWeight: '700' },
  title: { color: colors.white, fontSize: 23, fontWeight: '700' },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
