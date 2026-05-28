import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ClubCrest } from '@/src/components/cards/ClubCrest';
import { RarityBadge } from '@/src/components/RarityBadge';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Match } from '@/src/types/models';
import { formatKickoffDate, formatKickoffTime, getMatchScoreLabel, getMatchViewState, getTeamDisplay } from '@/src/utils/matchUtils';

export function MatchTile({
  match,
  onPress,
  matchdayLabel,
}: {
  match: Match;
  onPress?: () => void;
  matchdayLabel?: string;
}) {
  const teams = getTeamDisplay(match);
  const viewState = getMatchViewState(match);
  const scoreLabel = getMatchScoreLabel(match);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.competition}>{match.competition}</Text>
        <RarityBadge rarity={match.importance} />
      </View>

      <View style={styles.mainRow}>
        <View style={styles.crestSide}>
          <ClubCrest size={50} source={getClubCrestSource(teams.homeClub || teams.homeClubId)} />
        </View>

        <View style={styles.centerBlock}>
          <Text style={styles.kickoffDate}>{formatKickoffDate(match)}</Text>
          <Text style={styles.kickoffTime}>{formatKickoffTime(match)}</Text>
          <Text style={styles.score}>{scoreLabel || 'vs'}</Text>
        </View>

        <View style={styles.crestSide}>
          <ClubCrest size={50} source={getClubCrestSource(teams.awayClub || teams.awayClubId)} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.meta}>{matchdayLabel ? `${matchdayLabel} · ` : ''}{match.stadiumName}</Text>
        <Text style={styles.status}>{viewState.statusLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: curvao.colors.surface,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderWidth: 1,
    gap: curvao.spacing.sm,
    padding: curvao.spacing.base,
  },
  pressed: {
    opacity: 0.84,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  competition: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.heavy,
  },
  mainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crestSide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    flex: 1.2,
    gap: 2,
  },
  kickoffDate: {
    color: curvao.colors.muted,
    fontSize: 11,
    fontWeight: curvao.typography.weight.heavy,
    letterSpacing: 0.8,
  },
  kickoffTime: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.base,
    fontWeight: curvao.typography.weight.heavy,
  },
  score: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.black,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: curvao.colors.muted,
    flex: 1,
    fontSize: 12,
  },
  status: {
    color: curvao.colors.greenBright,
    fontSize: 11,
    fontWeight: curvao.typography.weight.heavy,
  },
});
