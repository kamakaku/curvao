import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import type { MatchdaySetPreview as MatchdaySetPreviewData } from '@/src/services/cardSetService';
import type { ResolvedSetSlot } from '@/src/utils/setProgressUtils';
import { curvao } from '@/src/theme/curvaoTheme';

type MatchdaySetPreviewProps = {
  preview?: MatchdaySetPreviewData | null;
  fallbackReason?: string;
  finalMatch?: boolean;
  onPress?: () => void;
  onOpenRewardPackage?: () => void;
};

export function MatchdaySetPreview({
  preview,
  fallbackReason,
  finalMatch = false,
  onOpenRewardPackage,
  onPress,
}: MatchdaySetPreviewProps) {
  if (!preview) {
    return (
      <View style={styles.panel}>
        <TextureOverlay opacity={0.05} />
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>MATCHDAY SET</Text>
            <Text style={styles.subtitle}>{fallbackReason ?? 'Für dieses Match ist noch kein Matchday Set verfügbar.'}</Text>
          </View>
        </View>
      </View>
    );
  }

  const { set, progress, featuredSlots } = preview;
  const bonusText = getBonusText(set.completionReward);
  const rewardPending = progress.slots.some((slot) => slot.status === 'reward_pending');

  return (
    <View style={styles.panel}>
      <TextureOverlay opacity={0.05} />
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>MATCHDAY SET</Text>
          <Text style={styles.subtitle}>Vervollständige dieses Spiel mit Match-, Player- und Moment Cards.</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressValue}>{progress.ownedSlots}/{progress.totalSlots || '—'}</Text>
          <Text style={styles.progressLabel}>CARDS</Text>
        </View>
      </View>

      <Text style={styles.definition}>
        {progress.ownedSlots === 0
          ? 'Starte mit Live Watch oder Stadium Check-in, um die ersten Cards zu verdienen.'
          : finalMatch
            ? 'Das Spiel ist beendet. Sammle fehlende Matchday Cards und entdecke besondere Momente.'
            : 'Matchday Sets sammeln alle digitalen Erinnerungen eines Spiels: MatchCard, StadiumCard, PlayerCards und besondere Moment Cards.'}
      </Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, progress.percent * 100)}%` }]} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.slots}
      >
        {featuredSlots.map((slot) => (
          <View key={slot.slot.id} style={[styles.slot, slot.status === 'owned' && styles.slotOwned, slot.status === 'wanted' && styles.slotWanted]}>
            <Ionicons color={getSlotColor(slot.status)} name={getSlotIcon(slot)} size={18} />
            <Text numberOfLines={1} style={styles.slotLabel}>{slot.title}</Text>
            <Text numberOfLines={1} style={styles.slotState}>{getSlotStateLabel(slot.status)}</Text>
          </View>
        ))}
      </ScrollView>

      {bonusText ? (
        <Text style={styles.bonus}>Set Bonus: {bonusText}</Text>
      ) : null}

      {rewardPending ? (
        <Pressable disabled={!onOpenRewardPackage} onPress={onOpenRewardPackage} style={[styles.secondaryButton, !onOpenRewardPackage && styles.secondaryButtonDisabled]}>
          <Text style={[styles.secondaryButtonText, !onOpenRewardPackage && styles.secondaryButtonTextDisabled]}>REWARD ÖFFNEN</Text>
        </Pressable>
      ) : null}

      <Pressable disabled={!onPress} onPress={onPress} style={[styles.button, !onPress && styles.buttonDisabled]}>
        <Text style={[styles.buttonText, !onPress && styles.buttonTextDisabled]}>SET ANSEHEN</Text>
        <Ionicons color={onPress ? curvao.colors.textInverted : curvao.colors.muted} name={onPress ? 'chevron-forward' : 'lock-closed-outline'} size={16} />
      </Pressable>
    </View>
  );
}

function getBonusText(reward?: MatchdaySetPreviewData['completionReward']) {
  if (!reward) return undefined;
  const parts = [];
  if (reward.xp) parts.push(`+${reward.xp} XP`);
  if (reward.title) parts.push(reward.title);
  return parts.join(' · ');
}

function getSlotIcon(slot: ResolvedSetSlot): keyof typeof Ionicons.glyphMap {
  if (slot.status === 'owned') return 'checkmark-circle';
  if (slot.status === 'wanted') return 'bookmark';
  if (slot.status === 'reward_pending') return 'gift-outline';
  if (slot.status === 'locked') return 'lock-closed-outline';

  switch (slot.slot.slotType) {
    case 'match_card':
      return 'football-outline';
    case 'stadium_card':
    case 'attendance_card':
    case 'stadium_checkin_reward':
      return 'location-outline';
    case 'player_card':
    case 'mvp_card':
      return 'person-outline';
    case 'moment_card':
      return 'sparkles-outline';
    case 'live_watch_reward':
      return 'tv-outline';
    default:
      return 'help-outline';
  }
}

function getSlotColor(status: ResolvedSetSlot['status']) {
  switch (status) {
    case 'owned':
      return '#22C878';
    case 'wanted':
      return curvao.colors.gold;
    case 'reward_pending':
      return curvao.colors.gold;
    case 'locked':
      return curvao.colors.muted;
    default:
      return curvao.colors.gold;
  }
}

function getSlotStateLabel(status: ResolvedSetSlot['status']) {
  switch (status) {
    case 'owned':
      return 'BESITZT';
    case 'wanted':
      return 'GESUCHT';
    case 'locked':
      return 'LOCKED';
    case 'reward_pending':
      return 'REWARD';
    default:
      return 'FEHLT';
  }
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(18,22,20,0.88)',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    padding: 18,
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
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  definition: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  progressBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 74,
    padding: 10,
  },
  progressValue: {
    color: curvao.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  progressLabel: {
    color: curvao.colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  track: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 7,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: curvao.colors.gold,
    height: '100%',
  },
  slots: {
    gap: 8,
    paddingRight: 6,
  },
  slot: {
    alignItems: 'center',
    backgroundColor: 'rgba(7,9,8,0.52)',
    borderColor: 'rgba(216,170,77,0.14)',
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 88,
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: 104,
  },
  slotOwned: {
    borderColor: 'rgba(34,200,120,0.34)',
  },
  slotWanted: {
    borderColor: 'rgba(216,170,77,0.34)',
  },
  slotLabel: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  slotState: {
    color: curvao.colors.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  bonus: {
    color: curvao.colors.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonDisabled: {
    opacity: 0.65,
  },
  secondaryButtonText: {
    color: curvao.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  secondaryButtonTextDisabled: {
    color: curvao.colors.muted,
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
