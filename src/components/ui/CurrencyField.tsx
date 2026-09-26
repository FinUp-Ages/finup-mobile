import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - campo de valor monetario em reais, formato "R$ 00,00".
 *
 * Passivo: `value`/`onChange` trafegam sempre em reais (decimal) - quem usa
 * nao precisa saber que por dentro a digitacao e tratada em centavos. Segue o
 * mesmo espirito do DateField (mascara aplicada enquanto digita, valor
 * canonico exposto por fora).
 *
 * Limite de 12 digitos (10 inteiros + 2 decimais) espelha exatamente o
 * @Digits(integer = 10, fraction = 2) de CreateTransactionRequest no backend.
 */
type CurrencyFieldProps = {
  value: number;
  onChange: (value: number) => void;
  onTouch?: () => void;
  error?: string | boolean;
  placeholder?: string;
};

function centsToText(cents: number): string {
  const [integerPart, decimalPart] = (cents / 100).toFixed(2).split('.');
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${withThousands},${decimalPart}`;
}

export function CurrencyField({ value, onChange, onTouch, error, placeholder }: CurrencyFieldProps) {
  const hasError = Boolean(error);
  const message = typeof error === 'string' ? error : undefined;
  const cents = Math.round(value * 100);

  function handleChangeText(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    const nextCents = digits ? Number(digits) : 0;
    onChange(Number((nextCents / 100).toFixed(2)));
  }

  return (
    <View style={styles.wrapper}>
      <TextInput
        keyboardType="number-pad"
        placeholder={placeholder ?? 'R$ 0,00'}
        placeholderTextColor={colors.placeholder}
        value={centsToText(cents)}
        onChangeText={handleChangeText}
        onBlur={onTouch}
        style={[styles.input, hasError ? styles.inputError : null]}
      />
      {message ? <Text style={styles.errorText}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: colors.error,
  },
  wrapper: {
    marginBottom: 20,
  },
});
