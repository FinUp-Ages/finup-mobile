import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ChatbotHeaderProps {
  showModel: boolean;
  onOpenMenu: () => void;
}

export function ChatbotHeader({ showModel, onOpenMenu }: ChatbotHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Abrir menu"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onOpenMenu}
        style={styles.menuButton}
      >
        <Ionicons color="#FFFFFF" name="menu" size={27} />
      </Pressable>

      {showModel ? (
        <View accessibilityLabel="Modelo atual: Sonnet 2.0" style={styles.modelPill}>
          <Text style={styles.modelLabel}>Sonnet 2.0</Text>
          <Ionicons color="#D7E6F3" name="chevron-down" size={17} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 38 },
  menuButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  modelLabel: { color: '#F5F9FC', fontSize: 14 },
  modelPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(26, 61, 101, 0.7)',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
});
