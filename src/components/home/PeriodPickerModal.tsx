import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { colors, darkColors } from '@/theme/colors';
import { HOME_PERIODS, type HomePeriodKey } from '@/utils/homePeriods';

/** COMPONENT - lista de periodos do card de saldo (7/15/30 dias, 3/6/12 meses). */
type PeriodPickerModalProps = {
  visible: boolean;
  selected: HomePeriodKey;
  onSelect: (key: HomePeriodKey) => void;
  onClose: () => void;
};

export function PeriodPickerModal({
  visible,
  selected,
  onSelect,
  onClose,
}: PeriodPickerModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Fechar" onPress={onClose} style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Período</Text>
          {HOME_PERIODS.map((option) => {
            const active = option.key === selected;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={option.key}
                onPress={() => {
                  onSelect(option.key);
                  onClose();
                }}
                style={({ pressed }) => [styles.option, pressed ? styles.pressed : null]}
              >
                <Text style={[styles.optionLabel, active ? styles.optionActive : null]}>
                  {option.label}
                </Text>
                {active ? <Feather color={darkColors.textPrimary} name="check" size={18} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: darkColors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  option: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  optionActive: {
    fontWeight: '600',
  },
  optionLabel: {
    color: darkColors.textPrimary,
    fontSize: 16,
  },
  pressed: {
    backgroundColor: darkColors.pressed,
  },
  sheet: {
    backgroundColor: darkColors.background,
    borderColor: colors.glass,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  title: {
    color: darkColors.textLabel,
    fontSize: 12,
    letterSpacing: 0.24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
});
