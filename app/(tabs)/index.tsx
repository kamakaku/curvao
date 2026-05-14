import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CardTile } from '@/src/components/CardTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { MatchTile } from '@/src/components/MatchTile';
import { StatPill } from '@/src/components/StatPill';
import { getCurrentUser } from '@/src/services/authService';
import { getLatestCards } from '@/src/services/cardService';
import { getMatches } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Match, UserCard } from '@/src/types/models';

export default function HomeScreen() {
  const [nextMatch, setNextMatch] = useState<Match>();
  const [latestCards, setLatestCards] = useState<UserCard[]>([]);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      const [matches, cards] = await Promise.all([getMatches(), getLatestCards(user.id)]);
      setNextMatch(matches.find((match) => match.status !== 'finished') ?? matches[0]);
      setLatestCards(cards);
    }

    load();
  }, []);

  return (
    <CurvaoScreen>
      <View style={styles.brand}>
        <Text style={styles.kicker}>Verified football cards</Text>
        <Text style={styles.logo}>Curvao</Text>
        <Text style={styles.copy}>Earned proof, lasting memory, real play material.</Text>
      </View>

      <View style={styles.stats}>
        <StatPill label="Archive" value={latestCards.length} />
        <StatPill label="Mission" value="1" />
        <StatPill label="Bond" value="Live" />
      </View>

      <Text style={styles.section}>Next Match</Text>
      {nextMatch ? <MatchTile match={nextMatch} /> : <EmptyState title="No matches yet" body="PocketBase can provide live match records when collections are configured." />}

      <Text style={styles.section}>Latest Cards</Text>
      <View style={styles.grid}>
        {latestCards.map((card) => <CardTile key={card.id} card={card} />)}
      </View>
      {latestCards.length === 0 ? <EmptyState title="Archive is empty" body="Check in to a match to mint proof and player cards." /> : null}

      <View style={styles.mission}>
        <Text style={styles.missionTitle}>Active Mission</Text>
        <Text style={styles.missionText}>Verify a match this week to unlock the first supporter patch.</Text>
      </View>
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  brand: {
    gap: 6,
  },
  kicker: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  logo: {
    color: curvao.colors.text,
    fontSize: 42,
    fontWeight: '900',
  },
  copy: {
    color: curvao.colors.muted,
    fontSize: 15,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  section: {
    color: curvao.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mission: {
    backgroundColor: curvao.colors.surfaceElevated,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderWidth: 1,
    padding: 16,
  },
  missionTitle: {
    color: curvao.colors.gold,
    fontWeight: '800',
  },
  missionText: {
    color: curvao.colors.text,
    marginTop: 6,
  },
});
