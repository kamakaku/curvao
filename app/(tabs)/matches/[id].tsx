import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { CardTile } from '@/src/components/CardTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RarityBadge } from '@/src/components/RarityBadge';
import { getCurrentUser } from '@/src/services/authService';
import { createCheckin } from '@/src/services/checkinService';
import { getClubName, getMatchById } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CheckinType, Match, UserCard } from '@/src/types/models';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<Match>();
  const [createdCards, setCreatedCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getMatchById(id).then(setMatch);
    }
  }, [id]);

  async function handleCheckin(type: CheckinType) {
    if (!id) return;
    setLoading(true);
    try {
      const user = await getCurrentUser();
      const result = await createCheckin(user.id, id, type);
      setCreatedCards(result.cards);
    } catch (error) {
      Alert.alert('Check-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!match) {
    return (
      <CurvaoScreen>
        <EmptyState title="Match not found" />
        <PrimaryButton label="Back to Matches" onPress={() => router.back()} variant="secondary" />
      </CurvaoScreen>
    );
  }

  return (
    <CurvaoScreen>
      <Text style={styles.kicker}>{match.competition}</Text>
      <Text style={styles.title}>{getClubName(match.homeClub)} vs {getClubName(match.awayClub)}</Text>
      <Text style={styles.meta}>{new Date(match.kickoffAt).toLocaleString()} | {match.stadiumName}, {match.stadiumCity}</Text>
      <RarityBadge rarity={match.importance} />

      <View style={styles.actions}>
        <PrimaryButton label={loading ? 'Checking in...' : 'Stadium'} onPress={() => handleCheckin('stadium')} disabled={loading} />
        <PrimaryButton label="Logged Viewing" onPress={() => handleCheckin('viewing')} disabled={loading} variant="secondary" />
      </View>

      <Text style={styles.section}>Generated Cards</Text>
      <View style={styles.grid}>
        {createdCards.map((card) => <CardTile key={card.id} card={card} />)}
      </View>
      {createdCards.length === 0 ? <EmptyState title="No check-in yet" body="Choose a check-in type to generate one Match Card and 3-5 Player Cards." /> : null}
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: curvao.colors.gold,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: curvao.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  meta: {
    color: curvao.colors.muted,
  },
  actions: {
    gap: 10,
  },
  section: {
    color: curvao.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
