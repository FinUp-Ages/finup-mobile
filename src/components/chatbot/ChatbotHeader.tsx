import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';

interface ChatbotHeaderProps {
  showAssistantStatus: boolean;
  onOpenMenu: () => void;
}

export function ChatbotHeader({ showAssistantStatus, onOpenMenu }: ChatbotHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Abrir menu"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onOpenMenu}
        style={styles.menuButton}
      >
        <Ionicons color={colors.white} name="menu" size={27} />
      </Pressable>

      {showAssistantStatus ? (
        <View accessibilityLabel="Assistente financeiro" style={styles.modelPill}>
          <Text style={styles.modelLabel}>Assistente</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 38 },
  menuButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  modelLabel: { color: colors.chatTextBright, fontSize: 14 },
  modelPill: {
    alignItems: 'center',
    backgroundColor: colors.chatPill,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
});
