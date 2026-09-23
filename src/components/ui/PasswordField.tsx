import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - campo de senha com botao de "olho" pra mostrar/esconder o
 * texto digitado.
 *
 * Passivo: o unico estado que guarda e "esta revelando a senha ou nao" - o
 * valor em si, validacao e onChange continuam responsabilidade de quem usa,
 * igual ao TextField.
 */
type PasswordFieldProps = Omit<TextInputProps, 'secureTextEntry'> & {
  error?: string | boolean;
};

export function PasswordField({ error, style, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);
  const message = typeof error === 'string' ? error : undefined;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inputRow, hasError ? styles.inputError : null]}>
        <TextInput
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          // Desliga a sugestao de "senha forte" do sistema (iOS/Android): sem
          // isso, o SO mostra um balao sobre o teclado que, ao ser fechado,
          // pode limpar o campo inteiro - confundindo com um bug de digitacao.
          // Sem sentido mante-la ligada aqui, ja que nao ha Keychain/gerenciador
          // de senha real por tras (o envio inteiro ainda e mockado).
          textContentType="oneTimeCode"
          importantForAutofill="no"
          style={[styles.input, style]}
          secureTextEntry={!visible}
          {...inputProps}
        />
        <Pressable hitSlop={8} onPress={() => setVisible((prev) => !prev)}>
          <Feather name={visible ? 'eye' : 'eye-off'} size={18} color={colors.icon} />
        </Pressable>
      </View>
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
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
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
  },
  wrapper: {
    marginBottom: 20,
  },
});
