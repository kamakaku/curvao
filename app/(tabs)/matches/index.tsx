import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { MatchTile } from '@/src/components/MatchTile';
import { getMatches } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Match } from '@/src/types/models';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    getMatches().then(setMatches);
  }, []);

  return (
    <CurvaoScreen>
      <Text style={styles.title}>Matches</Text>
      <Text style={styles.copy}>Check in from the stadium or log a verified viewing to archive proof.</Text>
      {matches.map((match) => (
        <Link key={match.id} href={`/matches/${match.id}`} asChild>
          <MatchTile match={match} />
        </Link>
      ))}
      {matches.length === 0 ? <EmptyState title="No matches available" /> : null}
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: curvao.colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  copy: {
    color: curvao.colors.muted,
  },
});
