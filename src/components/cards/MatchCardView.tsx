import { StyleSheet, Text, View } from 'react-native';

import { GenericCardFrame } from '@/src/components/cards/GenericCardFrame';
import { formatCardOrigin, getCardRelations } from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

export function MatchCardView({ card, compact }: { card: UserCard; compact?: boolean }) {
  const { match, homeClub, awayClub } = getCardRelations(card);
  const hasScore = match?.homeScore !== undefined && match?.awayScore !== undefined;

  return (
    <GenericCardFrame card={card} compact={compact}>
      <View style={styles.body}>
        <Text style={styles.competition}>{match?.competition ?? card.subtitle ?? 'Verified Match'}</Text>
        <Text style={styles.teams} numberOfLines={2}>
          {homeClub?.shortName ?? homeClub?.name ?? 'HOME'} vs {awayClub?.shortName ?? awayClub?.name ?? 'AWAY'}
        </Text>
        {hasScore ? <Text style={styles.score}>{match?.homeScore} - {match?.awayScore}</Text> : null}
        <Text style={styles.date}>{match ? new Date(match.kickoffAt).toLocaleDateString() : new Date(card.acquiredAt).toLocaleDateString()}</Text>
        <Text style={styles.stadium} numberOfLines={1}>{match?.stadiumName ?? 'Verified Stadium'}</Text>
        <Text style={styles.checkin}>{formatCardOrigin(card.origin)}</Text>
      </View>
    </GenericCardFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  competition: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  teams: {
    color: curvao.colors.text,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 10,
  },
  score: {
    color: curvao.colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  date: {
    color: curvao.colors.muted,
    fontSize: 13,
    marginTop: 10,
  },
  stadium: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  checkin: {
    color: curvao.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 12,
    textTransform: 'uppercase',
  },
});
