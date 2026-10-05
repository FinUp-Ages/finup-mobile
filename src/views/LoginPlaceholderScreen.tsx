import { useRouter } from 'expo-router';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CadastroHeader } from '@/components/common/CadastroHeader';
import { styles as stepStyles } from '@/components/common/cadastroStepStyles';
import { Text } from '@/components/ui/AppText';
import { PasswordField } from '@/components/ui/PasswordField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme/colors';
import { useLoginViewModel } from '@/viewmodels/useLoginViewModel';

/**
 * VIEW - login de quem ja e cliente, com e-mail e senha.
 *
 * Segue o layout das telas do cadastro (cabecalho, titulo + subtitulo, campos e
 * botao principal no rodape). So observa o useLoginViewModel.
 */
export default function LoginPlaceholderScreen() {
  const router = useRouter();
  const {
    email,
    password,
    emailError,
    error,
    canSubmit,
    submitting,
    setEmail,
    setPassword,
    touchEmail,
    submit,
  } = useLoginViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <CadastroHeader title="Entrar" onClose={() => router.back()} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <Text style={stepStyles.title}>Já sou cliente</Text>
            <Text style={stepStyles.subtitle}>Entre com seu e-mail e senha</Text>

            <View style={stepStyles.fields}>
              <TextField
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                onBlur={touchEmail}
                error={emailError}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                autoComplete="email"
              />
              <PasswordField
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={submit}
                returnKeyType="go"
                textContentType="password"
                autoComplete="current-password"
                importantForAutofill="yes"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          label="Entrar"
          icon="next"
          disabled={!canSubmit && !submitting}
          loading={submitting}
          onPress={submit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
