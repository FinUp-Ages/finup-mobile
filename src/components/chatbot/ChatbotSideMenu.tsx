import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import type { ConversationSummary } from '@/types/chatbot';

export interface ChatbotSideMenuProps {
  activeConversationId: string | null;
  conversations: ConversationSummary[];
  /** Enquanto uma mensagem é enviada não dá para trocar de conversa. */
  disabled: boolean;
  error: string | null;
  isLoading: boolean;
  visible: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  onRetry: () => void;
  onSelectConversation: (id: string) => void;
}

/** COMPONENT - drawer lateral com histórico de conversas conforme o Figma (#121212). */
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
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Fechar menu lateral"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          style={[
            styles.drawer,
            {
              paddingTop: Math.max(insets.top + 16, 48),
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
        >
          {/* Barra superior com fechar e nova conversa */}
          <View style={styles.headerRow}>
            <Pressable
              accessibilityLabel="Fechar menu"
              accessibilityRole="button"
              hitSlop={12}
              onPress={onClose}
              style={styles.iconBtn}
            >
              <Ionicons color={colors.white} name="close" size={26} />
            </Pressable>

            <Pressable
              accessibilityLabel="Nova conversa"
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              disabled={disabled}
              hitSlop={12}
              onPress={onNewConversation}
              style={[styles.iconBtn, disabled ? styles.itemDisabled : null]}
            >
              <Ionicons color={colors.white} name="create-outline" size={22} />
            </Pressable>
          </View>

          {/* Subtítulo da seção */}
          <Text style={styles.sectionTitle}>Histórico de conversas</Text>
          <View style={styles.divider} />

          {/* Feedback de erro */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                accessibilityLabel="Tentar novamente carregar conversas"
                accessibilityRole="button"
                onPress={onRetry}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Conteúdo da Lista */}
          {isLoading && conversations.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.textMuted} size="small" />
            </View>
          ) : !error && conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma conversa anterior</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.list}
            >
              {conversations.map((item) => {
                const isSelected = item.id === activeConversationId;
                const displayTitle = item.title?.trim() || 'Nova conversa';

                return (
                  <Pressable
                    accessibilityLabel={`Abrir conversa: ${displayTitle}`}
                    accessibilityRole="button"
                    accessibilityState={{ disabled, selected: isSelected }}
                    disabled={disabled}
                    key={item.id}
                    onPress={() => onSelectConversation(item.id)}
                    style={({ pressed }) => [
                      styles.itemRow,
                      isSelected ? styles.itemRowActive : null,
                      disabled ? styles.itemDisabled : null,
                      pressed ? styles.itemRowPressed : null,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.itemText, isSelected ? styles.itemTextActive : null]}
                    >
                      {displayTitle}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 1,
    width: '100%',
  },
  drawer: {
    backgroundColor: colors.drawerBackground,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    width: '78%',
  },
  emptyContainer: {
    paddingVertical: 24,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  errorContainer: {
    paddingVertical: 16,
  },
  errorText: {
    color: colors.errorOnDark,
    fontSize: 13,
    lineHeight: 18,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconBtn: {
    padding: 4,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemRow: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  itemRowActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemRowPressed: {
    opacity: 0.6,
  },
  itemText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  itemTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flex: 1,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryText: {
    color: colors.chatAccent,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 16,
  },
});
