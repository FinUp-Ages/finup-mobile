import { useState } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { colors, learningColors } from '@/theme/colors';

/** Area de toque e foco visivel compartilhados pelas acoes da trilha. */
export function LearningButton({ style, onFocus, onBlur, ...props }: PressableProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => [
        styles.base,
        typeof style === 'function' ? style(state) : style,
        state.pressed && styles.pressed,
        focused && styles.focused,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  pressed: { opacity: 0.7 },
  focused: {
    outlineColor: learningColors.focus,
    outlineWidth: 3,
    outlineOffset: 3,
    backgroundColor: colors.glassStrong,
  },
});
