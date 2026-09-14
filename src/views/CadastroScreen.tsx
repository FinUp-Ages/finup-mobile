import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CadastroHeader } from '@/components/common/CadastroHeader';
import { CadastroStepAdicionais } from '@/components/common/CadastroStepAdicionais';
import { CadastroStepDados } from '@/components/common/CadastroStepDados';
import { CadastroStepSenha } from '@/components/common/CadastroStepSenha';
import { StepProgress } from '@/components/common/StepProgress';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useCadastroViewModel } from '@/viewmodels/useCadastroViewModel';

const TOTAL_STEPS = 3;

/**
 * VIEW - fluxo de cadastro em 3 etapas (ver Figma).
 *
 * So observa o ViewModel e distribui os dados para os componentes de cada etapa.
 * Nao valida campo, nao chama Model, nao sabe que o envio e mockado.
 */
export default function CadastroScreen() {
  const router = useRouter();
  const {
    step,
    data,
    errors,
    canProceed,
    submitting,
    success,
    setField,
    touchField,
    goNext,
    goBack,
    submit,
  } = useCadastroViewModel();

  useEffect(() => {
    if (success) {
      Alert.alert('Cadastro realizado', 'Seus dados foram enviados (simulação).', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [success, router]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <CadastroHeader
          title="Dados cadastrais"
          onClose={() => router.back()}
          onBack={step > 1 ? goBack : undefined}
        />

        <View style={styles.content}>
          {step === 1 ? (
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

        <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        <PrimaryButton
          label={step < TOTAL_STEPS ? 'Próximo' : 'Salvar'}
          icon={step < TOTAL_STEPS ? 'next' : 'save'}
          disabled={!canProceed}
          loading={submitting}
          onPress={step < TOTAL_STEPS ? goNext : submit}
        />
      </KeyboardAvoidingView>
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
    paddingTop: 8,
  },
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
});
