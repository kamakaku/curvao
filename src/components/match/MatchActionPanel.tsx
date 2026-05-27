import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { curvao } from '@/src/theme/curvaoTheme';

type MatchActionPanelProps = {
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant?: 'gold' | 'mint' | 'muted';
  icon: keyof typeof Ionicons.glyphMap;
  rewardTitle: string;
  rewardSubtitle: string;
  rules: { label: string; value: string }[];
  buttonLabel: string;
  disabled?: boolean;
  onPress?: () => void;
};

export function MatchActionPanel({
  title,
  subtitle,
  badge,
  badgeVariant = 'gold',
  icon,
  rewardTitle,
  rewardSubtitle,
  rules,
  buttonLabel,
  disabled,
  onPress,
}: MatchActionPanelProps) {
  const isDisabled = disabled || !onPress;
  const badgeStyle = badgeVariant === 'mint' ? styles.badgeMint : badgeVariant === 'muted' ? styles.badgeMuted : styles.badgeGold;

  return (
    <View style={[styles.panel, isDisabled && styles.panelDisabled]}>
      <TextureOverlay opacity={0.05} />
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeVariant === 'mint' && styles.badgeTextMint]}>{badge}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.rewardBox}>
          <View style={styles.iconWrap}>
            <Ionicons color={curvao.colors.gold} name={icon} size={26} />
          </View>
          <View style={styles.rewardCopy}>
            <Text style={styles.rewardKicker}>MÖGLICHER REWARD</Text>
            <Text style={styles.rewardTitle}>{rewardTitle}</Text>
            <Text style={styles.rewardSubtitle}>{rewardSubtitle}</Text>
          </View>
        </View>

        <View style={styles.rules}>
          {rules.map((rule) => (
            <View key={rule.label} style={styles.ruleRow}>
              <Text style={styles.ruleLabel}>{rule.label}</Text>
              <Text style={styles.ruleValue}>{rule.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable disabled={isDisabled} onPress={onPress} style={[styles.button, isDisabled && styles.buttonDisabled]}>
        <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>{buttonLabel}</Text>
        <Ionicons color={isDisabled ? curvao.colors.muted : curvao.colors.textInverted} name={isDisabled ? 'lock-closed-outline' : 'chevron-forward'} size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(18,22,20,0.88)',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 16,
    overflow: 'hidden',
    padding: 18,
  },
  panelDisabled: {
    opacity: 0.74,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeGold: {
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.26)',
  },
  badgeMint: {
    backgroundColor: 'rgba(34,200,120,0.12)',
    borderColor: 'rgba(34,200,120,0.32)',
  },
  badgeMuted: {
    backgroundColor: 'rgba(167,163,154,0.08)',
    borderColor: 'rgba(167,163,154,0.18)',
  },
  badgeText: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  badgeTextMint: {
    color: '#22C878',
  },
  body: {
    gap: 14,
  },
  rewardBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(7,9,8,0.52)',
    borderColor: 'rgba(216,170,77,0.14)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: 'rgba(216,170,77,0.20)',
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  rewardCopy: {
    flex: 1,
  },
  rewardKicker: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  rewardTitle: {
    color: curvao.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  rewardSubtitle: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  rules: {
    gap: 8,
  },
  ruleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ruleLabel: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  ruleValue: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  button: {
    alignItems: 'center',
    backgroundColor: curvao.colors.gold,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(167,163,154,0.10)',
    borderColor: 'rgba(167,163,154,0.16)',
    borderWidth: 1,
  },
  buttonText: {
    color: curvao.colors.textInverted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  buttonTextDisabled: {
    color: curvao.colors.muted,
  },
});
