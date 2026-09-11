import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppleIcon } from '@/components/ui/AppleIcon';
import { AuthButton } from '@/components/ui/AuthButton';
import { FinUpChartWatermark } from '@/components/ui/FinUpChartWatermark';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { useAuthInitialViewModel } from '@/viewmodels/useAuthInitialViewModel';

/**
 * VIEW - Tela inicial de autenticação do FinUp.
 *
 * Reproduz fielmente o design do Figma com gradiente azul, grafismo sutil,
 * logo FinUp com subtítulo e botões de ação com áreas seguras e responsividade.
 */
export default function AuthInitialScreen() {
  const insets = useSafeAreaInsets();
  const {
    isLoadingGoogle,
    isLoadingApple,
    isAnyLoading,
    error,
    handleCreateAccount,
    handleGoogleAuth,
    handleAppleAuth,
    handleAlreadyCustomer,
  } = useAuthInitialViewModel();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Fundo com degradê azul profissional conforme o Figma */}
      <LinearGradient
        colors={['#021430', '#05234D', '#0A427F', '#0C5396']}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Grafismo sutil de barras de crescimento financeiro ao fundo */}
      <FinUpChartWatermark />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 32, 60),
            paddingBottom: Math.max(insets.bottom + 16, 28),
          },
        ]}
      >
        {/* Bloco Superior: Logo e Subtítulo */}
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>FinUp</Text>
          <Text style={styles.subtitleText}>
            {'Clareza sobre seus gastos,\ndecisões financeiras seguras.'}
          </Text>
        </View>

        {/* Mensagem de Erro (se houver) */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Bloco Inferior: Ações de Autenticação */}
        <View style={styles.actionsContainer}>
          <AuthButton
            accessibilityLabel="Criar sua conta no FinUp"
            disabled={isAnyLoading}
            onPress={handleCreateAccount}
            testID="button-create-account"
            title="Crie sua conta"
            variant="primary"
          />

          <AuthButton
            accessibilityLabel="Continuar com o Google"
            disabled={isAnyLoading}
            icon={<GoogleIcon size={20} />}
            loading={isLoadingGoogle}
            onPress={handleGoogleAuth}
            testID="button-google-auth"
            title="Continue com google"
            variant="social"
          />

          <AuthButton
            accessibilityLabel="Continuar com a Apple"
            disabled={isAnyLoading}
            icon={<AppleIcon color="#000000" size={20} />}
            loading={isLoadingApple}
            onPress={handleAppleAuth}
            testID="button-apple-auth"
            title="Continue com Apple"
            variant="social"
          />

          <AuthButton
            accessibilityLabel="Já sou cliente, ir para o login"
            disabled={isAnyLoading}
            onPress={handleAlreadyCustomer}
            testID="button-already-customer"
            title="Já sou cliente"
            variant="link"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    gap: 16,
    width: '100%',
  },
  container: {
    backgroundColor: '#021430',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
  },
  errorText: {
    color: '#FECACA',
    fontSize: 14,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 68,
    fontWeight: '800',
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  subtitleText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    marginTop: 14,
    opacity: 0.95,
    textAlign: 'center',
  },
});
