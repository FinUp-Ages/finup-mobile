import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';

type PasswordFieldProps = Omit<TextInputProps, 'secureTextEntry'> & {
  error?: string | boolean;
  showToggle?: boolean;
};

export function PasswordField({
  error,
  style,
  showToggle = true,
  ...inputProps
}: PasswordFieldProps) {
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
          textContentType="oneTimeCode"
          importantForAutofill="no"
          style={[styles.input, style]}
          secureTextEntry={showToggle ? !visible : true}
          {...inputProps}
        />
        {showToggle ? (
          <Pressable hitSlop={8} onPress={() => setVisible((prev) => !prev)}>
            <Feather name={visible ? 'eye' : 'eye-off'} size={18} color={colors.icon} />
          </Pressable>
        ) : null}
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
