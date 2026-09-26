import { Feather } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - dropdown generico (nao existe nenhum select no projeto ainda).
 *
 * Passivo, no mesmo espirito do TextField/DateField: recebe as opcoes e o
 * valor selecionado por props, nao sabe de onde vieram (categorias, metodos
 * de pagamento etc). Ao tocar, abre uma lista simples num Modal secundario -
 * sem biblioteca de bottom sheet/select nova.
 */
export type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type SelectFieldProps<T extends string> = {
  value: T | null;
  options: SelectOption<T>[];
  placeholder: string;
  onChange: (value: T) => void;
  onTouch?: () => void;
  error?: string | boolean;
  loading?: boolean;
};

export function SelectField<T extends string>({
  value,
  options,
  placeholder,
  onChange,
  onTouch,
  error,
  loading,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const hasError = Boolean(error);
  const message = typeof error === 'string' ? error : undefined;
  const selected = options.find((option) => option.value === value);

  function handleOpen() {
    if (loading) return;
    setOpen(true);
  }

  function handleSelect(next: T) {
    onChange(next);
    setOpen(false);
    onTouch?.();
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handleOpen}
        style={[styles.inputRow, hasError ? styles.inputError : null]}
      >
        {selected?.icon ? <View style={styles.optionIcon}>{selected.icon}</View> : null}
        <Text
          numberOfLines={1}
          style={[styles.label, selected ? null : styles.placeholder]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.icon} size="small" />
        ) : (
          <Feather color={colors.icon} name="chevron-down" size={18} />
        )}
      </Pressable>
      {message ? <Text style={styles.errorText}>{message}</Text> : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <Pressable onPress={() => setOpen(false)} style={styles.overlay}>
          <View style={styles.optionsSheet}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={styles.optionRow}
              >
                {option.icon ? <View style={styles.optionIcon}>{option.icon}</View> : null}
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  label: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionsSheet: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 24,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  overlay: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flex: 1,
    justifyContent: 'center',
  },
  placeholder: {
    color: colors.placeholder,
  },
  wrapper: {
    marginBottom: 20,
  },
});
