import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ChatbotSideMenuProps {
  visible: boolean;
  onClose: () => void;
}

/** Painel visual temporario; as opcoes ainda nao possuem navegacao. */
export function ChatbotSideMenu({ visible, onClose }: ChatbotSideMenuProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Fechar menu" onPress={onClose} style={styles.backdrop} />
        <View style={styles.drawer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>FinUp</Text>
            <Pressable accessibilityLabel="Fechar menu" onPress={onClose}>
              <Ionicons color="#DDEAF5" name="close" size={25} />
            </Pressable>
          </View>
          <Text style={styles.section}>CONVERSAS</Text>
          <View style={styles.item}>
            <Ionicons color="#8FC9F0" name="chatbubble-ellipses-outline" size={20} />
            <Text style={styles.itemText}>Novo planejamento</Text>
          </View>
          <Text style={styles.hint}>Menu demonstrativo</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  drawer: { backgroundColor: '#082544', bottom: 0, left: 0, padding: 28, paddingTop: 62, position: 'absolute', top: 0, width: '78%' },
  hint: { bottom: 42, color: '#7794AF', fontSize: 12, left: 28, position: 'absolute' },
  item: { alignItems: 'center', backgroundColor: '#103456', borderRadius: 11, flexDirection: 'row', gap: 12, marginTop: 13, padding: 14 },
  itemText: { color: '#E8F3FB', fontSize: 14 },
  overlay: { backgroundColor: 'rgba(0, 12, 28, 0.65)', flex: 1 },
  section: { color: '#7FA7C7', fontSize: 11, fontWeight: '700', letterSpacing: 1.1, marginTop: 34 },
  title: { color: '#FFFFFF', fontSize: 23, fontWeight: '700' },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
