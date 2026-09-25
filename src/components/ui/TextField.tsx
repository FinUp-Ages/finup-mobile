import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - campo de texto generico.
 *
 * Passivo: so exibe valor/erro e repassa eventos por props. Nao sabe qual tela o
 * usa nem o que acontece com o valor digitado.
 *
 * `error={true}` marca a borda vermelha sem mensagem (campo obrigatorio ainda
 * vazio). `error="algum texto"` marca a borda E mostra a mensagem (valor
 * preenchido mas invalido).
 */
type TextFieldProps = TextInputProps & {
  error?: string | boolean;
};

export function TextField({ error, style, ...inputProps }: TextFieldProps) {
  const hasError = Boolean(error);
  const message = typeof error === 'string' ? error : undefined;

  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholderTextColor={colors.placeholder}
        style={[styles.input, hasError ? styles.inputError : null, style]}
        {...inputProps}
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
