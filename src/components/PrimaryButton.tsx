import { Pressable, StyleSheet, Text } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({ label, onPress, disabled, variant = 'primary' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: curvao.colors.gold,
    borderRadius: curvao.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: curvao.colors.border,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: '#151006',
    fontWeight: '800',
  },
  secondaryLabel: {
    color: curvao.colors.text,
  },
});
