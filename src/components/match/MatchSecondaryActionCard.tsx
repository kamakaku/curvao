import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type MatchSecondaryActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
  description?: string;
  buttonLabel: string;
  disabled?: boolean;
  onPress?: () => void;
  inGroup?: boolean;
  variant?: 'card' | 'tile';
};

export function MatchSecondaryActionCard({
  icon,
  title,
  status,
  description,
  buttonLabel,
  disabled,
  onPress,
  inGroup = false,
  variant = 'card',
}: MatchSecondaryActionCardProps) {
  if (variant === 'tile') {
    return (
      <Pressable disabled={!onPress || disabled} onPress={onPress} style={[styles.tile, disabled && styles.tileDisabled]}>
        <Text numberOfLines={1} style={styles.tileTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.tileSubtitle}>{description ?? 'Im Stadion einchecken'}</Text>
        <View style={styles.tileDivider} />
        <View style={styles.tileStatusRow}>
          <Ionicons color={disabled ? curvao.colors.gold : '#22C878'} name={disabled ? 'checkmark-circle' : 'ellipse'} size={10} />
          <Text numberOfLines={1} style={[styles.tileStatus, disabled && styles.tileStatusDisabled]}>
            {status}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, inGroup && styles.cardInGroup, disabled && styles.cardDisabled]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons color={curvao.colors.gold} name={icon} size={20} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>{status}</Text></View>
      </View>

      {description ? <Text numberOfLines={1} style={styles.description}>{description}</Text> : null}

      <Pressable disabled={!onPress || disabled} onPress={onPress} style={[styles.button, (!onPress || disabled) && styles.buttonDisabled]}>
        <Text style={[styles.buttonText, (!onPress || disabled) && styles.buttonTextDisabled]}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18,22,20,0.84)',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 112,
    padding: 14,
  },
  cardInGroup: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 8,
  },
  cardDisabled: {
    opacity: 0.9,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  badge: {
    backgroundColor: 'rgba(167,163,154,0.10)',
    borderColor: 'rgba(167,163,154,0.22)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  description: {
    color: curvao.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  button: {
    alignItems: 'center',
    borderColor: 'rgba(216,170,77,0.30)',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 44,
  },
  buttonDisabled: {
    borderColor: 'rgba(167,163,154,0.16)',
  },
  buttonText: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  buttonTextDisabled: {
    color: curvao.colors.muted,
  },
  tile: {
    backgroundColor: 'rgba(29,22,8,0.72)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    height: 80,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  tileDisabled: {
    opacity: 0.9,
  },
  tileTitle: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  tileSubtitle: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 0,
  },
  tileDivider: {
    display: 'none',
  },
  tileStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216, 170, 77, 0.15)',
    marginTop: 2,
  },
  tileStatus: {
    color: '#22C878',
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tileStatusDisabled: {
    color: curvao.colors.gold,
  },
});
