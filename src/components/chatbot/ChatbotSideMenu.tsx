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
import type { Conversation } from '@/types/chatbot';

interface ChatbotSideMenuProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
  onNewConversation?: () => void;
}

/** COMPONENT - drawer lateral com historico de conversas conforme o Figma (#121212). */
export function ChatbotSideMenu({
  visible,
  onClose,
  conversations,
  currentConversationId,
  isLoading,
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
          {/* Botao de fechar no topo esquerdo */}
          <Pressable
            accessibilityLabel="Fechar menu"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
            style={styles.closeBtn}
          >
            <Ionicons color="#FFFFFF" name="close" size={26} />
          </Pressable>

          {/* Subtitulo da secao */}
          <Text style={styles.sectionTitle}>Histórico de conversas</Text>
          <View style={styles.divider} />

          {/* Conteudo da Lista */}
          {isLoading && conversations.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#A1A1AA" size="small" />
            </View>
          ) : conversations.length === 0 ? (
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
                const isSelected = item.id === currentConversationId;
                const displayTitle = item.title?.trim() || 'Nova conversa';

                return (
                  <Pressable
                    accessibilityLabel={`Abrir conversa: ${displayTitle}`}
                    accessibilityRole="button"
                    key={item.id}
                    onPress={() => onSelectConversation(item.id)}
                    style={({ pressed }) => [
                      styles.itemRow,
                      isSelected ? styles.itemRowActive : null,
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
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    padding: 4,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 1,
    width: '100%',
  },
  drawer: {
    backgroundColor: '#121212',
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    width: '75%',
  },
  emptyContainer: {
    paddingVertical: 24,
  },
  emptyText: {
    color: '#71717A',
    fontSize: 14,
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  itemTextActive: {
    color: '#FFFFFF',
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
  sectionTitle: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 16,
  },
});
