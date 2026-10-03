import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENTS - seletor em pilula do modal de transacao (mockup) e a lista de
 * opcoes em chips que ele abre DENTRO do cartao, logo abaixo das pilulas.
 *
 * Diferente do SelectField do cadastro, nada abre por cima do formulario: quem
 * usa controla qual pilula esta aberta e renderiza um unico ChipOptions.
 * Passivos: valores, opcoes e estado chegam por props.
 */
export type ChipOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  accessibilityLabel?: string;
};

type PillSelectProps = {
  label: string;
  selectedLabel?: string;
  icon?: ReactNode;
  open: boolean;
  loading?: boolean;
  error?: boolean;
  onPress: () => void;
};

export function PillSelect({
  label,
  selectedLabel,
  icon,
  open,
  loading,
  error,
  onPress,
}: PillSelectProps) {
  return (
    <Pressable
      accessibilityHint={open ? 'Fecha a lista de opções' : 'Abre a lista de opções'}
      accessibilityLabel={selectedLabel ? `${label}: ${selectedLabel}` : label}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        open ? styles.pillOpen : null,
        error ? styles.pillError : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {icon ?? <View style={[styles.dot, selectedLabel ? styles.dotSelected : null]} />}
      <Text numberOfLines={1} style={styles.pillLabel}>
        {selectedLabel ?? label}
      </Text>
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <MaterialCommunityIcons
          color={colors.white}
          name={open ? 'chevron-up' : 'unfold-more-horizontal'}
          size={16}
        />
      )}
    </Pressable>
  );
}

type ChipOptionsProps = {
  options: ChipOption[];
  value: string | null;
  emptyMessage: string;
  onSelect: (value: string) => void;
};

export function ChipOptions({ options, value, emptyMessage, onSelect }: ChipOptionsProps) {
  if (options.length === 0) {
    return <Text style={styles.empty}>{emptyMessage}</Text>;
  }

  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => [
              styles.chip,
              selected ? styles.chipSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            {option.icon}
            <Text style={[styles.chipLabel, selected ? styles.chipLabelSelected : null]}>
              {option.label}
            </Text>
            {selected ? <Feather color={colors.textPrimary} name="check" size={14} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  chipLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: colors.textPrimary,
  },
  chipSelected: {
    backgroundColor: colors.white,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dot: {
    backgroundColor: 'transparent',
    borderColor: colors.white,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 12,
    width: 12,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
  empty: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.8,
    textAlign: 'center',
  },
  pill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'transparent',
    borderRadius: 10000,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 45,
    paddingHorizontal: 16,
  },
  pillError: {
    borderColor: colors.errorOnDark,
  },
  pillLabel: {
    color: colors.white,
    flex: 1,
    fontSize: 16,
  },
  pillOpen: {
    borderColor: colors.white,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
