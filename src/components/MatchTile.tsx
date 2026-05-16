import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RarityBadge } from '@/src/components/RarityBadge';
import { getClubName } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Match } from '@/src/types/models';

export function MatchTile({ match, onPress }: { match: Match; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.competition}>{match.competition}</Text>
        <RarityBadge rarity={match.importance} />
      </View>
      <Text style={styles.teams}>{getClubName(match.homeClub)} vs {getClubName(match.awayClub)}</Text>
      <Text style={styles.meta}>{new Date(match.kickoffAt).toLocaleString()} | {match.stadiumName}</Text>
      <Text style={styles.status}>{match.status.toUpperCase()}</Text>
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
  teams: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.heavy,
  },
  meta: {
    color: curvao.colors.muted,
  },
  status: {
    color: curvao.colors.greenBright,
    fontSize: 11,
    fontWeight: curvao.typography.weight.heavy,
  },
});
