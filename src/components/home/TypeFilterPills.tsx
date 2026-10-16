import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { colors, darkColors } from '@/theme/colors';
import type { TransactionTypeFilter } from '@/types/home';
import { TYPE_FILTER_OPTIONS } from '@/utils/transactionFilters';

type TypeFilterPillsProps = {
  selected: TransactionTypeFilter;
  onSelect: (filter: TransactionTypeFilter) => void;
};

export function TypeFilterPills({ selected, onSelect }: TypeFilterPillsProps) {
  return (
    <View accessibilityRole="radiogroup" style={styles.container}>
      {TYPE_FILTER_OPTIONS.map((option) => {
        const isSelected = option.key === selected;

        return (
          <Pressable
            accessibilityLabel={`Filtrar por ${option.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={({ pressed }) => [
              styles.pill,
              isSelected ? styles.pillSelected : null,
              pressed ? styles.pillPressed : null,
            ]}
          >
            {option.key === 'INCOME' ? (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isSelected ? darkColors.background : darkColors.incomeDot },
                ]}
              />
            ) : null}

            {option.key === 'EXPENSE' ? (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isSelected ? darkColors.background : darkColors.expenseDot },
                ]}
              />
            ) : null}

            <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  label: {
    color: darkColors.textBadge,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelSelected: {
    color: darkColors.background,
    fontWeight: '600',
  },
  pill: {
    alignItems: 'center',
    backgroundColor: colors.glassSoft,
    borderColor: colors.glass,
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillPressed: {
    opacity: 0.8,
  },
  pillSelected: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
});