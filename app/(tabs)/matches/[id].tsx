import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, ScrollView } from 'react-native';

import { CardDetailPanel } from '@/src/components/CardDetailPanel';
import { CardTile } from '@/src/components/CardTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RarityBadge } from '@/src/components/RarityBadge';
import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { getCurrentUser } from '@/src/services/authService';
import { createCheckin } from '@/src/services/checkinService';
import { getUserCards } from '@/src/services/cardService';
import { getClubName, getMatchById } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CheckinType, Match, UserCard } from '@/src/types/models';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<Match>();
  const [createdCards, setCreatedCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<UserCard>();
  const [matchCard, setMatchCard] = useState<UserCard>();

  useEffect(() => {
    if (id) {
      getMatchById(id).then(setMatch);
      getCurrentUser().then(user => {
        getUserCards(user.id).then(cards => {
          const found = cards.find(c => c.match === id && c.type === 'match');
          setMatchCard(found);
        });
      });
    }
  }, [id]);

  async function handleCheckin(type: CheckinType) {
    if (!id) return;
    setLoading(true);
    try {
      const user = await getCurrentUser();
      const result = await createCheckin(user.id, id, type);
      setCreatedCards(result.cards);
      const newMatchCard = result.cards.find(c => c.type === 'match');
      if (newMatchCard) setMatchCard(newMatchCard);
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

  // Create a preview card if no match card exists
  const previewCard: UserCard | undefined = matchCard || (match ? {
    id: 'preview',
    user: 'preview',
    type: 'match',
    title: `${getClubName(match.homeClub)} vs ${getClubName(match.awayClub)}`,
    subtitle: `${match.competition} | ${new Date(match.kickoffAt).toLocaleDateString()}`,
    rarity: match.importance,
    origin: 'stadium_verified',
    match: match.id,
    editionNumber: 0,
    editionSize: 1200,
    tradable: false,
    bound: false,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 1,
    acquiredAt: new Date().toISOString(),
    archived: false,
    favorite: false,
  } : undefined);

  return (
    <CurvaoScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardContainer}>
          {previewCard && <CardRenderer card={previewCard} />}
        </View>

        <View style={styles.details}>
          <Text style={styles.kicker}>{match.competition}</Text>
          <Text style={styles.title}>{getClubName(match.homeClub)} vs {getClubName(match.awayClub)}</Text>
          <Text style={styles.meta}>{new Date(match.kickoffAt).toLocaleString()} | {match.stadiumName}, {match.stadiumCity}</Text>
          <RarityBadge rarity={match.importance} />

          <View style={styles.actions}>
            {!matchCard && (
              <>
                <PrimaryButton label={loading ? 'Checking in...' : 'Stadium Check-in'} onPress={() => handleCheckin('stadium')} disabled={loading} />
                <PrimaryButton label="Logged Viewing" onPress={() => handleCheckin('viewing')} disabled={loading} variant="secondary" />
              </>
            )}
            {matchCard && (
              <View style={styles.ownedBadge}>
                <Text style={styles.ownedText}>MATCH CARD ARCHIVED</Text>
              </View>
            )}
          </View>

          <Text style={styles.section}>Generated Cards</Text>
          <View style={styles.grid}>
            {createdCards.filter(c => c.type !== 'match').map((card) => <CardTile key={card.id} card={card} onPress={() => setSelectedCard(card)} />)}
          </View>
          {createdCards.length === 0 && !matchCard ? <EmptyState title="No check-in yet" body="Choose a check-in type to generate your Match Card and Player Cards." /> : null}
        </View>
      </ScrollView>

      <CardDetailPanel card={selectedCard} cards={createdCards} onClose={() => setSelectedCard(undefined)} />
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    width: '80%',
  },
  details: {
    gap: 16,
  },
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
    marginTop: 8,
  },
  ownedBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 107, 0.1)',
    borderColor: '#00ff6b',
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
  },
  ownedText: {
    color: '#00ff6b',
    fontWeight: '900',
    letterSpacing: 1,
  },
  section: {
    color: curvao.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

