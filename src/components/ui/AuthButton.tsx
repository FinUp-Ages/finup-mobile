import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export type AuthButtonVariant = 'primary' | 'social' | 'link';

export interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant?: AuthButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export function AuthButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  testID,
  accessibilityLabel,
}: AuthButtonProps) {
  const isInteractive = !disabled && !loading;

  if (variant === 'link') {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isInteractive, busy: loading }}
        disabled={!isInteractive}
        onPress={onPress}
        style={({ pressed }) => [
          styles.linkContainer,
          pressed && isInteractive && styles.linkPressed,
          disabled && styles.disabled,
          style,
        ]}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={[styles.linkText, textStyle]}>{title}</Text>
        )}
      </Pressable>
    );
  }

  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        isPrimary ? styles.primaryButton : styles.socialButton,
        pressed && isInteractive && (isPrimary ? styles.primaryPressed : styles.socialPressed),
        disabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#1E293B'} size="small" />
      ) : (
        <>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.buttonText,
              isPrimary ? styles.primaryText : styles.socialText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    borderRadius: 28,
    elevation: 2,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    width: 24,
  },
  linkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  linkPressed: {
    opacity: 0.6,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#061A35',
  },
  primaryPressed: {
    backgroundColor: '#041226',
    opacity: 0.9,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
  },
  socialPressed: {
    backgroundColor: '#F1F5F9',
    opacity: 0.92,
  },
  socialText: {
    color: '#1E293B',
    fontWeight: '600',
  },
});
