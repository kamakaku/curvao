import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CardDetailPanel } from '@/src/components/CardDetailPanel';
import { CardTile } from '@/src/components/CardTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { DashboardActiveMission } from '@/src/components/dashboard/DashboardActiveMission';
import { DashboardNextMatch } from '@/src/components/dashboard/DashboardNextMatch';
import { DashboardProgress } from '@/src/components/dashboard/DashboardProgress';
import { EmptyState } from '@/src/components/EmptyState';
import { getCurrentUser } from '@/src/services/authService';
import { useAuth } from '@/src/providers/AuthProvider';
import { getLatestCards } from '@/src/services/cardService';
import { getMatches } from '@/src/services/matchService';
import { getUnopenedRewardPackages, type RewardPackage } from '@/src/services/rewardPackageService';
import { UnopenedPackageTile } from '@/src/components/rewards/UnopenedPackageTile';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Match, UserCard } from '@/src/types/models';

export default function HomeScreen() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [nextMatch, setNextMatch] = useState<Match>();
  const [latestCards, setLatestCards] = useState<UserCard[]>([]);
  const [unopenedPackages, setUnopenedPackages] = useState<RewardPackage[]>([]);
  const [selectedCard, setSelectedCard] = useState<UserCard>();

  useEffect(() => {
    async function load() {
      try {
        if (!authUser) return;
        
        const [matches, cards, packages] = await Promise.all([
            getMatches(), 
            getLatestCards(authUser.id),
            getUnopenedRewardPackages(authUser.id)
        ]);
        setNextMatch(matches.find((match) => match.status !== 'finished') ?? matches[0]);
        setLatestCards(cards);
        setUnopenedPackages(packages);
      } catch (err) {
        console.error('[HomeScreen] Failed to load data:', err);
      }
    }

    load();
  }, [authUser]);

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.container}>
        {/* Unopened Packages Section */}
        {unopenedPackages.length > 0 && (
          <View style={styles.section}>
            <UnopenedPackageTile 
                count={unopenedPackages.length} 
                package={unopenedPackages[0]}
                onPress={() => router.push(`/reward-package/${unopenedPackages[0].id}`)}
            />
          </View>
        )}

        {/* Next Match Section */}
        <View style={styles.section}>
          {nextMatch ? (
            <DashboardNextMatch 
              match={nextMatch} 
              onPress={() => router.push(`/matches/${nextMatch.id}`)} 
            />
          ) : (
            <EmptyState title="No matches yet" />
          )}
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <DashboardProgress />
        </View>

        {/* Latest Cards Section */}
        <View style={styles.cardsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NEUESTE CARDS</Text>
            <Pressable style={({ pressed }) => [styles.seeAllRow, pressed && styles.pressed]}>
               <Text style={styles.seeAllText}>Alle anzeigen</Text>
               <Ionicons name="chevron-forward" size={14} color={curvao.colors.gold} />
            </Pressable>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalCards}
            decelerationRate="fast"
            snapToInterval={154} // card width (140) + gap (14)
          >
            {latestCards.map((card) => (
              <View key={card.id} style={styles.cardWrapper}>
                <CardTile card={card} onPress={() => setSelectedCard(card)} fullWidth />
              </View>
            ))}
            {latestCards.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Noch keine Karten gesammelt</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Active Mission Section */}
        <View style={styles.section}>
          <DashboardActiveMission />
        </View>
      </View>

      <CardDetailPanel card={selectedCard} cards={latestCards} onClose={() => setSelectedCard(undefined)} />
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: curvao.spacing.lg,
    paddingTop: curvao.spacing.md,
    paddingBottom: 40,
    gap: curvao.spacing.xl,
  },
  section: {
    width: '100%',
  },
  cardsSection: {
    width: '100%',
    marginLeft: -2, // Optical alignment
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: curvao.spacing.md,
  },
  sectionTitle: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  seeAllText: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  horizontalCards: {
    gap: 14,
    paddingRight: curvao.spacing.lg,
  },
  cardWrapper: {
    width: 140, 
  },
  emptyContainer: {
    paddingVertical: 20,
  },
  emptyText: {
    color: curvao.colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
});

