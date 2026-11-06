import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/AppText';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme/colors';
import type { Answer, TriageQuestion } from '@/types/triage';

export function TriageQuestionField({ question, value, error, onChange }: {
  question: TriageQuestion; value: Answer | undefined; error?: string; onChange: (value: Answer) => void;
}) {
  const [numberText, setNumberText] = useState(value === undefined ? '' : String(value).replace('.', ','));
  if (question.type === 'NUMBER') {
    return <TextField
      accessibilityLabel={question.text}
      value={numberText}
      keyboardType={question.decimals === 0 ? 'number-pad' : 'decimal-pad'}
      placeholder={question.decimals === 0 ? 'Digite a quantidade' : 'Valor em R$ (ex.: 1500,00)'}
      maxLength={18}
      onChangeText={(text) => {
        setNumberText(text);
        const normalized = text.trim().replace(',', '.');
        onChange(/^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : text);
      }}
      error={error}
    />;
  }
  const multiple = question.type === 'MULTIPLE_CHOICE';
  const options = question.type === 'BOOLEAN'
    ? [{ value: 'true', label: 'Sim' }, { value: 'false', label: 'Não' }]
    : question.options ?? [];
  return <View>
    <View style={multiple ? styles.chips : styles.options} accessibilityRole={multiple ? undefined : 'radiogroup'}>
    {options.map((option) => {
      const selected = multiple ? Array.isArray(value) && value.includes(option.value)
        : question.type === 'BOOLEAN' ? value === (option.value === 'true') : value === option.value;
      return <Pressable key={option.value}
        accessibilityRole={multiple ? 'checkbox' : 'radio'} accessibilityState={{ checked: selected }}
        onPress={() => {
          if (multiple) {
            const previous = Array.isArray(value) ? value : [];
            onChange(selected ? previous.filter((item) => item !== option.value) : [...previous, option.value]);
          } else onChange(question.type === 'BOOLEAN' ? option.value === 'true' : option.value);
        }}
        style={({ pressed }) => [multiple ? styles.chip : styles.option,
          selected && (multiple ? styles.chipSelected : styles.selected), pressed && styles.pressed]}>
        <Text style={[multiple ? styles.chipLabel : styles.label, multiple && selected && styles.chipLabelSelected]}>{option.label}</Text>
        {!multiple ? <Feather name={selected ? 'check-circle' : 'circle'} color={colors.navy} size={20} /> : null}
      </Pressable>;
    })}
    </View>
    {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  options: { gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { backgroundColor: colors.inputBackground, borderRadius: 24, paddingHorizontal: 18, minHeight: 44, justifyContent: 'center' },
  chipSelected: { backgroundColor: colors.navy },
  chipLabel: { color: colors.navy, fontSize: 13 },
  chipLabelSelected: { color: colors.white },
  option: { backgroundColor: colors.inputBackground, borderRadius: 10, borderWidth: 1, borderColor: colors.inputBackground, padding: 16, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selected: { borderColor: colors.navy, backgroundColor: colors.track },
  pressed: { opacity: 0.75 },
  label: { flex: 1, color: colors.navy, fontSize: 15, lineHeight: 22 },
  error: { color: colors.error, fontSize: 13, marginTop: 8 },
});
