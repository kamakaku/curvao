import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ClubCrest } from '@/src/components/cards/ClubCrest';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import type { Match } from '@/src/types/models';
import { formatKickoffDate, formatKickoffTime, getMatchScoreLabel, getMatchViewState, getTeamDisplay } from '@/src/utils/matchUtils';

type MatchListCardProps = {
  match: Match;
  onPress?: () => void;
  hasMatchdaySet?: boolean;
  matchdayLabel?: string;
};

export function MatchListCard({ match, onPress, hasMatchdaySet, matchdayLabel }: MatchListCardProps) {
  const teams = getTeamDisplay(match);
  const viewState = getMatchViewState(match);
  const score = getMatchScoreLabel(match);
  const showStadium = match.stadiumName && match.stadiumName !== 'Unknown Stadium';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <Text numberOfLines={1} style={styles.league}>{match.competition}</Text>
        <View style={[styles.statusBadge, getStatusStyle(viewState.status)]}>
          <Text style={styles.statusText}>{viewState.statusLabel}</Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.teamCol}>
          <ClubCrest size={42} source={getClubCrestSource(teams.homeClub || teams.homeClubId)} />
          <Text numberOfLines={2} style={styles.teamName}>{teams.homeName}</Text>
        </View>

        <View style={styles.centerCol}>
          <Text style={styles.kickoffDate}>{formatKickoffDate(match)}</Text>
          <Text style={styles.kickoffTime}>{formatKickoffTime(match)}</Text>
          <Text style={styles.score}>{score || 'vs'}</Text>
          {matchdayLabel ? <Text style={styles.matchday}>{matchdayLabel}</Text> : null}
        </View>

        <View style={styles.teamCol}>
          <ClubCrest size={42} source={getClubCrestSource(teams.awayClub || teams.awayClubId)} />
          <Text numberOfLines={2} style={styles.teamName}>{teams.awayName}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text numberOfLines={1} style={styles.stadium}>
          {showStadium ? match.stadiumName : 'Stadion folgt'}
        </Text>
        <View style={styles.indicators}>
          {viewState.canLiveWatch ? <Indicator color="#22C878" icon="play-circle" label="Live Watch" /> : null}
          {viewState.canStadiumCheckIn ? <Indicator color="#D8AA4D" icon="location" label="Check-in" /> : null}
          {hasMatchdaySet ? <Indicator color="#D8AA4D" icon="albums" label="Set" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

function Indicator({ color, icon, label }: { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.indicator}>
      <Ionicons color={color} name={icon} size={12} />
      <Text style={styles.indicatorText}>{label}</Text>
    </View>
  );
}

function getStatusStyle(status: ReturnType<typeof getMatchViewState>['status']) {
  if (status === 'live') return styles.statusLive;
  if (status === 'final') return styles.statusFinal;
  if (status === 'upcoming') return styles.statusUpcoming;
  return styles.statusArchived;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.16)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    minHeight: 138,
    padding: 14,
  },
  pressed: {
    opacity: 0.84,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  league: {
    color: '#D8AA4D',
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statusBadge: {
    borderRadius: 999,
    minHeight: 24,
    minWidth: 74,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLive: {
    backgroundColor: 'rgba(34,200,120,0.18)',
  },
  statusFinal: {
    backgroundColor: 'rgba(216,170,77,0.16)',
  },
  statusUpcoming: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statusArchived: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statusText: {
    color: '#F4F1E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  mainRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  teamCol: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  teamName: {
    color: '#F4F1E8',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  centerCol: {
    alignItems: 'center',
    flex: 0.92,
    gap: 2,
  },
  kickoffDate: {
    color: '#A7A39A',
    fontSize: 11,
    fontWeight: '800',
  },
  kickoffTime: {
    color: '#F4F1E8',
    fontSize: 13,
    fontWeight: '800',
  },
  score: {
    color: '#D8AA4D',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  matchday: {
    color: '#A7A39A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stadium: {
    color: '#A7A39A',
    flex: 1,
    fontSize: 12,
    paddingRight: 10,
  },
  indicators: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    maxWidth: '55%',
  },
  indicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  indicatorText: {
    color: '#A7A39A',
    fontSize: 10,
    fontWeight: '800',
  },
});
