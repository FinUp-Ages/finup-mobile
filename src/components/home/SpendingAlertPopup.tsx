import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { AlertIcon } from '@/components/ui/AlertIcon';
import { darkColors } from '@/theme/colors';
import type { SpendingAlert } from '@/types/spendingAlert';
import { formatAmount } from '@/utils/masks';

type SpendingAlertPopupProps = {
  alert: SpendingAlert | null;
  onDismiss: () => void;
  visible: boolean;
};

/** Modal temporário para o maior alerta C1 ainda não dispensado. */
export function SpendingAlertPopup({ alert, onDismiss, visible }: SpendingAlertPopupProps) {
  if (!alert) return null;

  const projection = `Se esse valor fosse investido, poderia chegar a ${formatAmount(
    alert.projection.futureValue,
  )} em ${alert.projection.years} anos, a ${alert.projection.annualRatePct}% ao ano.`;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View accessibilityViewIsModal style={styles.backdrop}>
        <View accessibilityLabel="Alerta de gastos" accessibilityRole="alert" style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconContainer}>
                <AlertIcon />
              </View>
              <Text style={styles.title}>Atenção!</Text>
            </View>
            <Text style={styles.category}>{alert.categoryName}</Text>
          </View>
          <Text style={styles.message}>{alert.message}</Text>
          <Text style={styles.message}>{projection}</Text>
          <Pressable
            accessibilityHint="Fecha e não mostra novamente este mesmo alerta"
            accessibilityLabel="Entendi, dispensar alerta"
            accessibilityRole="button"
            onPress={onDismiss}
            style={({ pressed }) => [styles.dismissButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.dismissText}>Entendi</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: darkColors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1C2630',
    borderColor: darkColors.analiseAlertBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    maxWidth: 340,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
  },
  category: {
    color: darkColors.analiseAlertText,
    fontSize: 14,
    fontWeight: '100',
    letterSpacing: 0.24,
  },
  dismissButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderColor: darkColors.analiseAlertBorder,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    minHeight: 36,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  dismissText: { color: darkColors.analiseAlertText, fontSize: 14, fontWeight: '700' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  iconContainer: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    transform: [{ scale: 1.2 }],
    width: 20,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    letterSpacing: 0.24,
    lineHeight: 20,
  },
  pressed: { opacity: 0.75 },
  title: {
    color: darkColors.analiseAlertText,
    fontSize: 14,
    fontWeight: '100',
    letterSpacing: 0.24,
  },
  titleRow: { alignItems: 'center', flexDirection: 'row', flex: 1, gap: 10 },
});
