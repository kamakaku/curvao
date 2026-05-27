import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CURVAO_DESIGN = {
  surface: '#121614',
  gold: '#D8AA4D',
  greenBright: '#22C878',
  danger: '#b8574d',
  text: '#F4F1E8',
  muted: '#A7A39A',
};

type Variant = 'default' | 'gold' | 'mint' | 'danger';

type CardActionButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: Variant;
  style?: any;
};

export function CardActionButton({
  label,
  icon,
  onPress,
  disabled,
  active,
  variant = 'default',
  style,
}: CardActionButtonProps) {
  const isGold = variant === 'gold' || active;
  const isMint = variant === 'mint';
  const isDanger = variant === 'danger';

  const tintColor = isGold 
    ? CURVAO_DESIGN.gold 
    : isMint 
    ? CURVAO_DESIGN.greenBright 
    : isDanger 
    ? CURVAO_DESIGN.danger 
    : CURVAO_DESIGN.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        isGold && styles.borderGold,
        isMint && styles.borderMint,
        isDanger && styles.borderDanger,
        active && styles.bgActive,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={icon} size={20} color={tintColor} />
      <Text style={[styles.label, { color: tintColor }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#121614',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.15)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    minHeight: 40,
  },
  borderGold: {
    borderColor: 'rgba(216,170,77,0.4)',
    boxShadow: `0px 0px 4px ${CURVAO_DESIGN.gold}1A`,
  },
  borderMint: {
    borderColor: 'rgba(34,200,120,0.4)',
  },
  borderDanger: {
    borderColor: 'rgba(184,87,77,0.4)',
  },
  bgActive: {
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: 'rgba(216,170,77,0.6)',
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
