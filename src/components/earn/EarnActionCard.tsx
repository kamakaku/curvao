import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

const texture = require('../../../assets/textures/curvao_universal_texture_overlay_2048.png');

type EarnActionCardProps = {
  title: string;
  subtitle: string;
  rewardLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  stateLabel: string;
  stateVariant: 'active' | 'available' | 'disabled';
  accent?: 'gold' | 'mint' | 'neutral';
  disabled?: boolean;
  onPress?: () => void;
};

export function EarnActionCard({
  title,
  subtitle,
  rewardLabel,
  icon,
  stateLabel,
  stateVariant,
  accent = 'gold',
  disabled = false,
  onPress,
}: EarnActionCardProps) {
  const isDisabled = disabled || stateVariant === 'disabled' || !onPress;
  const accentColor = accent === 'mint' ? '#22C878' : accent === 'neutral' ? curvao.colors.muted : curvao.colors.gold;
  const showLock = stateVariant === 'disabled';

  return (
    <Pressable disabled={isDisabled} onPress={onPress} style={[styles.card, isDisabled && styles.disabledCard]}>
      <Image source={texture} style={[styles.texture, { pointerEvents: 'none' }]} />
      <View style={styles.content}>
        <View style={[styles.iconWrap, { borderColor: isDisabled ? 'rgba(255,255,255,0.12)' : 'rgba(216,170,77,0.22)' }]}>
          <Ionicons color={isDisabled ? curvao.colors.muted : accentColor} name={icon} size={26} />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isDisabled && styles.disabledText]}>{title}</Text>
            <Text style={[styles.statePill, styles[`${stateVariant}State`]]}>{stateLabel}</Text>
          </View>
          <Text style={[styles.subtitle, isDisabled && styles.disabledSubText]}>{subtitle}</Text>
          <View style={[styles.rewardPill, isDisabled && styles.disabledPill]}>
            <Text style={[styles.rewardText, isDisabled && styles.disabledSubText]}>{rewardLabel}</Text>
          </View>
        </View>

        <Ionicons color={isDisabled ? 'rgba(167,163,154,0.30)' : curvao.colors.gold} name={showLock ? 'lock-closed-outline' : 'chevron-forward'} size={20} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18,22,20,0.86)',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 108,
    overflow: 'hidden',
    boxShadow: '0px 10px 18px rgba(0,0,0,0.22)',
  },
  disabledCard: {
    borderColor: 'rgba(255,255,255,0.12)',
    opacity: 0.58,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.07,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: curvao.spacing.md,
    minHeight: 108,
    paddingHorizontal: curvao.spacing.lg,
    paddingVertical: 18,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  body: {
    flex: 1,
    gap: 7,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: curvao.spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    color: curvao.colors.gold,
    flex: 1,
    fontSize: curvao.typography.size.md,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  disabledText: {
    color: curvao.colors.muted,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.semiBold,
    lineHeight: 18,
  },
  disabledSubText: {
    color: 'rgba(167,163,154,0.72)',
  },
  statePill: {
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 9,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.8,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  activeState: {
    backgroundColor: 'rgba(34,200,120,0.14)',
    borderColor: 'rgba(34,200,120,0.36)',
    color: '#22C878',
  },
  availableState: {
    backgroundColor: 'rgba(216,170,77,0.12)',
    borderColor: 'rgba(216,170,77,0.28)',
    color: curvao.colors.gold,
  },
  disabledState: {
    backgroundColor: 'rgba(167,163,154,0.08)',
    borderColor: 'rgba(167,163,154,0.18)',
    color: curvao.colors.muted,
  },
  rewardPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.20)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  disabledPill: {
    backgroundColor: 'rgba(167,163,154,0.08)',
    borderColor: 'rgba(167,163,154,0.16)',
  },
  rewardText: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.black,
  },
});
