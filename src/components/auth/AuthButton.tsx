import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { curvao } from '@/src/theme/curvaoTheme';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
};

export function AuthButton({ label, onPress, disabled, loading, variant = 'primary' }: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  const isText = variant === 'text';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        isPrimary && styles.primary,
        !isPrimary && !isText && styles.secondary,
        isText && styles.textVariant,
        (disabled || loading) && !isText && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#000' : curvao.colors.gold} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.labelPrimary,
            !isPrimary && !isText && styles.labelSecondary,
            isText && styles.labelText,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primary: {
    backgroundColor: curvao.colors.gold,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.3)',
  },
  textVariant: {
    height: 44,
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  labelPrimary: {
    color: '#080A09',
  },
  labelSecondary: {
    color: curvao.colors.gold,
  },
  labelText: {
    color: curvao.colors.muted,
    fontSize: 12,
  },
});
