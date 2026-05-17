import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';

const CURVAO_COLORS = {
  surface: '#121614',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  mint: '#22C878',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
  borderMint: 'rgba(34,200,120,0.20)',
};

type CurvaoActionButtonProps = {
  variant: 'live' | 'stadium';
  title: string;
  subtitle: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function CurvaoActionButton({
  variant,
  title,
  subtitle,
  status,
  onPress,
}: Omit<CurvaoActionButtonProps, 'icon'>) {
  const isGold = variant === 'stadium';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isGold ? styles.borderGold : styles.borderMint,
        pressed && styles.pressed,
        isGold ? styles.shadowStadium : styles.shadowLive,
      ]}
    >
      {/* Unified Background Gradient with Opacity */}
      <LinearGradient
        colors={isGold 
          ? ['rgba(22, 18, 12, 0.75)', 'rgba(42, 34, 20, 0.65)'] 
          : ['rgba(10, 18, 14, 0.75)', 'rgba(15, 25, 20, 0.65)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Texture */}
      <TextureOverlay opacity={0.06} />

      <View style={styles.contentContainer}>
        {/* Top Section: Text Only */}
        <View style={styles.textSection}>
          <Text style={[styles.title, isGold && { color: CURVAO_COLORS.gold }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* Bottom Row: Full Width Status */}
        <View style={[styles.statusFullRow, isGold ? styles.statusBorderGold : styles.statusBorderMint]}>
          {isGold ? (
            <Ionicons name="checkmark-circle" size={10} color={CURVAO_COLORS.goldSoft} />
          ) : (
            <View style={styles.greenDot} />
          )}
          <Text style={[styles.statusText, isGold && { color: CURVAO_COLORS.goldSoft }]}>
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  borderGold: {
    borderColor: CURVAO_COLORS.borderGold,
  },
  borderMint: {
    borderColor: CURVAO_COLORS.borderMint,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: CURVAO_COLORS.text,
    fontSize: 12, // Slightly smaller title
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: CURVAO_COLORS.muted,
    fontSize: 10, // Slightly smaller subtitle
    fontWeight: '600',
    marginTop: 0,
  },
  statusFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 2,
  },
  statusBorderGold: {
    borderTopColor: 'rgba(216, 170, 77, 0.15)',
  },
  statusBorderMint: {
    borderTopColor: 'rgba(34, 200, 120, 0.1)',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CURVAO_COLORS.mint,
  },
  statusText: {
    color: CURVAO_COLORS.mint,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  shadowLive: {
    shadowColor: '#22C878',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  shadowStadium: {
    shadowColor: '#D8AA4D',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 2 },
  },
});

