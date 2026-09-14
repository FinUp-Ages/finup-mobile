import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { AppleIcon } from '@/components/ui/AppleIcon';
import { AuthButton } from '@/components/ui/AuthButton';
import { FinUpChartWatermark } from '@/components/ui/FinUpChartWatermark';
import { FinUpLogo } from '@/components/ui/FinUpLogo';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { useAuthInitialViewModel } from '@/viewmodels/useAuthInitialViewModel';

/**
 * VIEW - Tela de Login / Autenticacao do FinUp.
 *
 * Reproduz com total fidelidade o design do Figma:
 * - Fundo base escuro #031836 com glow circular #1C93D7;
 * - Logotipo oficial vetorizado FinUp (SVG);
 * - Subtitulo com tipografia precisa;
 * - Botoes de autenticacao ("Crie sua conta", Google, Apple e "Ja sou cliente");
 * - Integrado com ViewModel e Mocks para testes no mobile.
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

      {/* Degradê base de fundo (#031836) */}
      <LinearGradient
        colors={['#031836', '#031E44', '#052A5A', '#083B75']}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Efeito Glow difuso azul #1C93D7 com blur suave conforme especificado no Figma */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient
              id="figmaGlow"
              cx="50%"
              cy="75%"
              fx="50%"
              fy="75%"
              rx="80%"
              ry="50%"
            >
              <Stop offset="0%" stopColor="#1C93D7" stopOpacity="0.85" />
              <Stop offset="40%" stopColor="#156EA3" stopOpacity="0.5" />
              <Stop offset="75%" stopColor="#083B75" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#031836" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect fill="url(#figmaGlow)" height="100%" width="100%" x="0" y="0" />
        </Svg>
      </View>

      {/* Grafismo sutil do grafico financeiro em ascensao ao fundo */}
      <FinUpChartWatermark />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 40, 68),
            paddingBottom: Math.max(insets.bottom + 20, 32),
          },
        ]}
      >
        {/* Bloco Superior: Logotipo Oficial SVG + Subtitulo */}
        <View style={styles.headerContainer}>
          <FinUpLogo height={90} width={258} />
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

        {/* Bloco Inferior: Botoes de Acao */}
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
            accessibilityLabel="Ja sou cliente, entrar"
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
    backgroundColor: '#031836',
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
    marginTop: 32,
    width: '100%',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '400',
    lineHeight: 30,
    marginTop: 18,
    opacity: 0.95,
    textAlign: 'center',
  },
});


