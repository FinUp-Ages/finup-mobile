import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CadastroHeader } from '@/components/common/CadastroHeader';
import { CadastroStepAdicionais } from '@/components/common/CadastroStepAdicionais';
import { CadastroStepCodigo } from '@/components/common/CadastroStepCodigo';
import { CadastroStepDados } from '@/components/common/CadastroStepDados';
import { CadastroStepSenha } from '@/components/common/CadastroStepSenha';
import { StepProgress } from '@/components/common/StepProgress';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/colors';
import { useCadastroViewModel } from '@/viewmodels/useCadastroViewModel';

const TOTAL_STEPS = 3;

/**
 * VIEW - fluxo de cadastro em 3 etapas (ver Figma) + confirmacao do e-mail.
 *
 * So observa o ViewModel e distribui os dados para os componentes de cada etapa.
 * Nao valida campo, nao chama Model e nao navega sozinha.
 *
 * `?retomar=1` abre o cadastro na Etapa 2 para quem ja tem conta no Cognito mas
 * ainda nao foi criado no back (ver useCadastroViewModel).
 */
export default function CadastroScreen() {
  const { retomar } = useLocalSearchParams<{ retomar?: string }>();
  const {
    step,
    phase,
    data,
    errors,
    code,
    canProceed,
    submitting,
    checkingEmail,
    resending,
    codeResent,
    submitError,
    isLastStep,
    canGoBack,
    showProgress,
    setField,
    touchField,
    setCode,
    goNext,
    goBack,
    submit,
    resendCode,
    close,
  } = useCadastroViewModel({ resume: retomar === '1' });

  const isForm = phase === 'form';
  const buttonLabel = !isForm
    ? phase === 'code'
      ? 'Confirmar'
      : 'Tentar novamente'
    : isLastStep
      ? 'Salvar'
      : 'Próximo';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.sheet}>
        <SafeAreaView style={styles.innerSafe} edges={['bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
          >
            <CadastroHeader
              title={isForm ? 'Dados cadastrais' : 'Confirmação'}
              onClose={close}
              onBack={canGoBack && !submitting ? goBack : undefined}
            />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                {!isForm ? (
                  <CadastroStepCodigo
                    email={data.email}
                    code={code}
                    confirmed={phase === 'finishing'}
                    resending={resending}
                    codeResent={codeResent}
                    onChangeCode={setCode}
                    onResend={resendCode}
                  />
                ) : step === 1 ? (
                  <CadastroStepDados
                    data={data}
                    errors={errors}
                    onChange={setField}
                    onTouch={touchField}
                  />
                ) : step === 2 ? (
                  <CadastroStepAdicionais
                    data={data}
                    errors={errors}
                    onChange={setField}
                    onTouch={touchField}
                  />
                ) : (
                  <CadastroStepSenha
                    data={data}
                    errors={errors}
                    onChange={setField}
                    onTouch={touchField}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>

            {submitError ? (
              <Text style={styles.submitError} accessibilityLiveRegion="polite">
                {submitError}
              </Text>
            ) : null}

            {showProgress ? <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} /> : null}

            <PrimaryButton
              label={buttonLabel}
              icon={isForm && !isLastStep ? 'plus' : undefined}
              disabled={!canProceed}
              loading={submitting || checkingEmail}
              onPress={isForm && !isLastStep ? goNext : submit}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  flex: {
    flex: 1,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  innerSafe: {
    backgroundColor: colors.white,
    flex: 1,
  },
  screen: {
    backgroundColor: colors.screenBackground,
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
    overflow: 'hidden',
  },
  submitError: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});
