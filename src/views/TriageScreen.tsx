import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CadastroHeader } from '@/components/common/CadastroHeader';
import { StepProgress } from '@/components/common/StepProgress';
import { Text } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TriageQuestionField } from '@/components/triage/TriageQuestionField';
import { TriageAssessment } from '@/components/triage/TriageAssessment';
import { colors } from '@/theme/colors';
import { useTriageViewModel } from '@/viewmodels/useTriageViewModel';

export default function TriageScreen() {
  const vm = useTriageViewModel();
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { vm.close(); return true; });
    return () => subscription.remove();
  }, [vm.close]));
  const form = vm.status === 'form';
  return <SafeAreaView style={styles.screen} edges={['top']}>
    <StatusBar style="light" />
    <View style={styles.sheet}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View pointerEvents={vm.submitting ? 'none' : 'auto'}>
            <CadastroHeader title="Perfil de investidor" onClose={vm.close} onBack={form && vm.index > 0 ? vm.back : undefined} />
          </View>
          <ScrollView key={form ? vm.current?.id : vm.status} style={styles.flex}
            contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {vm.status === 'loading' ? <View style={styles.message}>
              <ActivityIndicator color={colors.navy} /><Text style={styles.subtitle}>Carregando seu perfil…</Text>
            </View> : vm.status === 'error' ? <View style={styles.message}>
              <Text style={styles.title}>Não foi possível carregar a triagem</Text>
              <Text style={styles.subtitle}>Verifique sua conexão e tente novamente.</Text>
              <PrimaryButton label="Tentar novamente" onPress={() => void vm.load()} />
            </View> : vm.status === 'assessment' && vm.assessment ? <TriageAssessment result={vm.assessment} />
              : form && vm.current ? <View pointerEvents={vm.submitting ? 'none' : 'auto'}>
                <Text style={styles.title}>Perfil financeiro</Text>
                <Text style={styles.subtitle}>Suas respostas nos ajudam a traçar seu perfil financeiro.</Text>
                <Text accessibilityRole="header" style={styles.question}>{vm.current.text}</Text>
                <Text style={styles.hint}>{vm.current.required ? 'Obrigatória' : 'Opcional'}{vm.current.type === 'MULTIPLE_CHOICE' ? ' · Selecione as opções que se aplicam' : ''}</Text>
                <TriageQuestionField key={vm.current.id} question={vm.current} value={vm.answers[vm.current.id]}
                  error={vm.errors[vm.current.id]} onChange={vm.setAnswer} />
              </View> : <Text style={styles.subtitle}>O questionário está indisponível no momento.</Text>}
          </ScrollView>
          {vm.notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{vm.notice}</Text> : null}
          {form && vm.current ? <>
            <StepProgress currentStep={vm.index + 1} totalSteps={vm.total} />
            <PrimaryButton label={vm.index === vm.total - 1 ? 'Ver meu perfil' : 'Próximo'} icon={vm.index < vm.total - 1 ? 'next' : undefined}
              loading={vm.submitting} onPress={() => void vm.next()} />
          </> : vm.status === 'assessment' ? <View style={styles.actions}>
            <PrimaryButton label="Refazer perfil de investidor" onPress={vm.retake} />
            <PrimaryButton label="Voltar ao perfil" onPress={vm.close} />
          </View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.navy },
  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  inner: { flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  content: { paddingTop: 24, paddingBottom: 24 },
  title: { color: colors.navy, fontSize: 20, fontWeight: '500' },
  subtitle: { color: colors.navy, fontSize: 15, lineHeight: 23, marginTop: 8 },
  question: { color: colors.navy, fontSize: 20, lineHeight: 28, fontWeight: '500', marginTop: 32 },
  hint: { color: colors.textSecondary, fontSize: 13, marginTop: 8, marginBottom: 20 },
  notice: { color: colors.navy, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  message: { gap: 16, paddingVertical: 32 },
  actions: { gap: 12 },
});
