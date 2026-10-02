import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { ConversationSummary } from '@/types/chatbot';

interface ChatbotSideMenuProps {
  conversations: ConversationSummary[];
  error: string | null;
  isLoading: boolean;
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
}

/** Lista metadados do historico; o backend ainda nao expoe mensagens para abrir uma conversa. */
export function ChatbotSideMenu({ conversations, error, isLoading, visible, onClose, onRetry }: ChatbotSideMenuProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Fechar menu" onPress={onClose} style={styles.backdrop} />
        <View style={styles.drawer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>FinUp</Text>
            <Pressable accessibilityLabel="Fechar menu" onPress={onClose}>
              <Ionicons color={colors.chatTextBright} name="close" size={25} />
            </Pressable>
          </View>
          <Text style={styles.section}>CONVERSAS</Text>
          {isLoading ? <ActivityIndicator color={colors.chatAccent} style={styles.loading} /> : null}
          {error ? (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : null}
          {!isLoading && !error && conversations.length === 0 ? <Text style={styles.hint}>Nenhuma conversa disponível.</Text> : null}
          {conversations.map((conversation) => (
            <View key={conversation.id} style={styles.item}>
              <Ionicons color={colors.chatAccent} name="chatbubble-ellipses-outline" size={20} />
              <Text numberOfLines={1} style={styles.itemText}>{conversation.title || 'Conversa sem título'}</Text>
            </View>
          ))}
          <Text style={styles.footerHint}>O histórico de mensagens ainda não está disponível.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  drawer: { backgroundColor: colors.chatDrawer, bottom: 0, left: 0, padding: 28, paddingTop: 62, position: 'absolute', top: 0, width: '78%' },
  feedback: { marginTop: 13 },
  feedbackText: { color: colors.chatTextBright, fontSize: 13, lineHeight: 19 },
  footerHint: { bottom: 42, color: colors.chatTextMuted, fontSize: 12, left: 28, position: 'absolute', right: 28 },
  hint: { color: colors.chatTextMuted, fontSize: 13, marginTop: 13 },
  item: { alignItems: 'center', backgroundColor: colors.chatDrawerItem, borderRadius: 11, flexDirection: 'row', gap: 12, marginTop: 13, padding: 14 },
  itemText: { color: colors.chatTextBright, flex: 1, fontSize: 14 },
  loading: { marginTop: 20 },
  overlay: { backgroundColor: colors.chatOverlay, flex: 1 },
  section: { color: colors.chatTextMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.1, marginTop: 34 },
  retryButton: { alignSelf: 'flex-start', marginTop: 9 },
  retryText: { color: colors.chatAccent, fontSize: 13, fontWeight: '700' },
  title: { color: colors.white, fontSize: 23, fontWeight: '700' },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
