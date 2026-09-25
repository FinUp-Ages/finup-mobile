import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CadastroHeader } from '@/components/common/CadastroHeader';
import { CadastroStepAdicionais } from '@/components/common/CadastroStepAdicionais';
import { CadastroStepDados } from '@/components/common/CadastroStepDados';
import { CadastroStepSenha } from '@/components/common/CadastroStepSenha';
import { StepProgress } from '@/components/common/StepProgress';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/colors';
import { useCadastroViewModel } from '@/viewmodels/useCadastroViewModel';

const TOTAL_STEPS = 3;

export default function CadastroScreen() {
  const router = useRouter();
  const {
    step,
    data,
    errors,
    canProceed,
    submitting,
    success,
    submitError,
    setField,
    touchField,
    goNext,
    goBack,
    submit,
  } = useCadastroViewModel();

  useEffect(() => {
    if (success) {
      Alert.alert('Cadastro realizado', 'Seus dados foram enviados com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [success, router]);

  useEffect(() => {
    if (submitError) {
      Alert.alert('Erro no cadastro', submitError);
    }
  }, [submitError]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.sheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <CadastroHeader
            title="Dados cadastrais"
            onClose={() => router.back()}
            onBack={step > 1 ? goBack : undefined}
          />

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          </TouchableWithoutFeedback>

          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} />

          <PrimaryButton
            label={step < TOTAL_STEPS ? 'Próximo' : 'Salvar'}
            icon={step < TOTAL_STEPS ? 'next' : undefined}
            disabled={!canProceed}
            loading={submitting}
            onPress={step < TOTAL_STEPS ? goNext : submit}
          />
        </KeyboardAvoidingView>
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
  screen: {
    backgroundColor: '#051329',
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
    overflow: 'hidden',
  },
});
