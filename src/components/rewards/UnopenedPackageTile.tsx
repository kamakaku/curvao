import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
import type { RewardPackage } from '@/src/services/rewardPackageService';

export function UnopenedPackageTile({
  count,
  package: rewardPackage,
  onPress,
}: {
  count?: number;
  package?: RewardPackage;
  onPress?: () => void;
}) {
  const resolvedCount = count ?? (rewardPackage ? 1 : 0);
  if (resolvedCount <= 0 && !rewardPackage) return null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Ionicons name="cube-outline" size={24} color={curvao.colors.gold} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{resolvedCount === 1 ? 'Reward Package wartet' : `${resolvedCount} Reward Packages warten`}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>{rewardPackage?.subtitle ?? 'Earned. Not Bought.'}</Text>
      </View>
      <View style={styles.ctaPill}>
        <Text style={styles.ctaText}>ÖFFNEN</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.9)',
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 82,
    padding: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: curvao.typography.weight.black,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: curvao.typography.weight.bold,
  },
  ctaPill: {
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ctaText: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.9,
  },
});
