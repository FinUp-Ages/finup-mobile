import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme/colors';
import { styles } from './cadastroStepStyles';

/**
 * COMPONENT - confirmacao do e-mail com o codigo de 6 digitos enviado pelo
 * Cognito depois do SignUp.
 *
 * Ainda nao esta no Figma: segue o layout das etapas do cadastro (titulo +
 * subtitulo + campos) ate o design existir.
 *
 * `confirmed` = codigo ja aceito; so falta o login e a criacao no back, entao o
 * campo some e fica so o aviso de que o cadastro esta sendo finalizado.
 */
type CadastroStepCodigoProps = {
  email: string;
  code: string;
  confirmed: boolean;
  resending: boolean;
  codeResent: boolean;
  onChangeCode: (value: string) => void;
  onResend: () => void;
};

export function CadastroStepCodigo({
  email,
  code,
  confirmed,
  resending,
  codeResent,
  onChangeCode,
  onResend,
}: CadastroStepCodigoProps) {
  if (confirmed) {
    return (
      <View>
        <Text style={styles.title}>E-mail confirmado</Text>
        <Text style={styles.subtitle}>Estamos finalizando o seu cadastro.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.title}>Confirme seu e-mail</Text>
      <Text style={styles.subtitle}>
        Enviamos um código de 6 dígitos para {email.trim().toLowerCase()}.
      </Text>

      <View style={styles.fields}>
        <TextField
          placeholder="Código"
          value={code}
          onChangeText={onChangeCode}
          keyboardType="number-pad"
          maxLength={6}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          accessibilityLabel="Código de confirmação"
        />
      </View>

      <View style={localStyles.resendRow}>
        {resending ? (
          <ActivityIndicator color={colors.link} size="small" />
        ) : (
          <Pressable hitSlop={8} onPress={onResend} accessibilityRole="button">
            <Text style={localStyles.resendLabel}>Reenviar código</Text>
          </Pressable>
        )}
        {codeResent ? <Text style={localStyles.resentText}>Código reenviado.</Text> : null}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  resendLabel: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '600',
  },
  resendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  resentText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
