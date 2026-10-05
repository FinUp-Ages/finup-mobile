import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/masks';

/**
 * COMPONENT - campo de valor monetario em reais, formato "R$ 00,00".
 *
 * Passivo: `value`/`onChange` trafegam sempre em reais (decimal) - quem usa
 * nao precisa saber que por dentro a digitacao e tratada em centavos. Segue o
 * mesmo espirito do DateField (mascara aplicada enquanto digita, valor
 * canonico exposto por fora). A formatacao e a mesma `formatCurrency` da renda
 * no cadastro; com valor zero o campo fica vazio e mostra o placeholder.
 * `variant="hero"` e o valor grande e centralizado do modal de transacao.
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
  variant?: 'field' | 'hero';
};

export function CurrencyField({
  value,
  onChange,
  onTouch,
  error,
  placeholder,
  variant = 'field',
}: CurrencyFieldProps) {
  const isHero = variant === 'hero';
  const hasError = Boolean(error);
  const message = typeof error === 'string' ? error : undefined;
  const cents = Math.round(value * 100);

  function handleChangeText(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    const nextCents = digits ? Number(digits) : 0;
    onChange(Number((nextCents / 100).toFixed(2)));
  }

  return (
    <View style={isHero ? null : styles.wrapper}>
      <TextInput
        accessibilityLabel="Valor"
        keyboardType="number-pad"
        placeholder={placeholder ?? 'R$ 0,00'}
        placeholderTextColor={colors.placeholder}
        value={cents > 0 ? formatCurrency(String(cents)) : ''}
        onChangeText={handleChangeText}
        onBlur={onTouch}
        style={[isHero ? styles.inputHero : styles.input, hasError ? styles.inputError : null]}
      />
      {message ? (
        <Text style={[styles.errorText, isHero ? styles.errorTextHero : null]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  errorTextHero: {
    color: colors.errorOnDark,
    textAlign: 'center',
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
  inputHero: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.surfaceLight,
    borderCurve: 'continuous',
    borderRadius: 12,
    borderWidth: 2,
    color: colors.navy,
    fontSize: 36,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    height: 71,
    paddingVertical: 12,
    textAlign: 'center',
  },
  inputError: {
    borderColor: colors.error,
  },
  wrapper: {
    marginBottom: 20,
  },
});
