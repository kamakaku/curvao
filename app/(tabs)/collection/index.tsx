import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CardDetailPanel } from '@/src/components/CardDetailPanel';
import { CardTile } from '@/src/components/CardTile';
import { WantedCardTile } from '@/src/components/cards/WantedCardTile';
import { WantedDetailModal } from '@/src/components/cards/WantedDetailModal';
import { WantedEmptyState } from '@/src/components/cards/WantedEmptyState';
import { WantedSearchBar } from '@/src/components/cards/WantedSearchBar';
import { WantedSearchResultTile } from '@/src/components/cards/WantedSearchResultTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { getCurrentUser } from '@/src/services/authService';
import { getVisibleCardSetsForUser, type CardSetProgress } from '@/src/services/cardSetService';
import { getUserCards } from '@/src/services/cardService';
import {
  getEarnPathsForTarget,
  getEarnPathsForWantedCard,
  getWantedCards,
  removeWantedCard,
  searchWantedTargets,
  toggleWantedCard,
  wantedCardToSearchResult,
  wantedInputFromTarget,
  type CardSearchResult,
  type EarnPath,
  type WantedCard,
} from '@/src/services/wantedCardService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const sections = ['Sammlung', 'Sets', 'Gesucht', 'Archiv'] as const;
type Section = (typeof sections)[number];

const filters = ['Alle', 'Match', 'Player', 'Club', 'Stadium', 'Patch', 'Verdient', 'Getauscht', 'Gebunden'] as const;
type Filter = (typeof filters)[number];
const setFilters = ['Alle', 'Club Season', 'Matchday', 'Stadium', 'Moment', 'Special'] as const;
type SetFilter = (typeof setFilters)[number];

function normalizeSection(value?: string | string[]): Section {
  const input = Array.isArray(value) ? value[0] : value;
  return sections.find((section) => section === input) ?? 'Sammlung';
}

function matchesFilter(card: UserCard, filter: Filter) {
  switch (filter) {
    case 'Match':
      return card.type === 'match';
    case 'Player':
      return card.type === 'player';
    case 'Club':
      return card.type === 'club';
    case 'Stadium':
      return card.origin === 'stadium_verified' || card.type === 'stadium';
    case 'Patch':
      return card.type === 'patch';
    case 'Verdient':
      return card.origin === 'self_earned' || card.origin === 'live_verified' || card.origin === 'stadium_verified';
    case 'Getauscht':
      return card.origin === 'traded';
    case 'Gebunden':
      return card.bound;
    default:
      return true;
  }
}

type WantedCardState = {
  wantedCard: WantedCard;
  earnPaths: EarnPath[];
};

export default function CollectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const [userId, setUserId] = useState('');
  const [cards, setCards] = useState<UserCard[]>([]);
  const [wantedCards, setWantedCards] = useState<WantedCardState[]>([]);
  const [setProgressItems, setSetProgressItems] = useState<CardSetProgress[]>([]);
  const [filter, setFilter] = useState<Filter>('Alle');
  const [activeSetFilter, setActiveSetFilter] = useState<SetFilter>('Alle');
  const [selected, setSelected] = useState<UserCard>();
  const [wantedQuery, setWantedQuery] = useState('');
  const [wantedResults, setWantedResults] = useState<CardSearchResult[]>([]);
  const [wantedLoading, setWantedLoading] = useState(false);
  const [selectedWantedResult, setSelectedWantedResult] = useState<CardSearchResult>();
  const [selectedWantedEarnPaths, setSelectedWantedEarnPaths] = useState<EarnPath[]>([]);

  const activeSection = normalizeSection(params.section);

  const load = useCallback(() => {
    let mounted = true;

    async function run() {
      const user = await getCurrentUser();
      const userCards = await getUserCards(user.id);
      const wanted = await getWantedCards(user.id);
      const wantedWithPaths = await Promise.all(
        wanted.map(async (wantedCard) => ({
          wantedCard,
          earnPaths: await getEarnPathsForWantedCard(wantedCard).catch(() => []),
        })),
      );
      const setProgress = await getVisibleCardSetsForUser({ userId: user.id, wantedCards: wanted }).catch(() => []);

      if (!mounted) return;
      setUserId(user.id);
      setCards(userCards);
      setWantedCards(wantedWithPaths);
      setSetProgressItems(setProgress.sort((a, b) => b.percent - a.percent || (a.set.title || a.set.name || '').localeCompare(b.set.title || b.set.name || '')));
    }

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(load);

  useEffect(() => {
    let active = true;

    async function run() {
      if (activeSection !== 'Gesucht') return;
      const trimmed = wantedQuery.trim();
      if (trimmed.length < 2) {
        setWantedResults([]);
        setWantedLoading(false);
        return;
      }

      setWantedLoading(true);
      const results = await searchWantedTargets(trimmed, cards, wantedCards.map((item) => item.wantedCard)).catch(() => []);
      if (!active) return;
      setWantedResults(results);
      setWantedLoading(false);
    }

    void run();

    return () => {
      active = false;
    };
  }, [activeSection, cards, wantedCards, wantedQuery]);

  const visibleCards = useMemo(() => cards.filter((card) => matchesFilter(card, filter)), [cards, filter]);
  const visibleSetProgressItems = useMemo(
    () =>
      setProgressItems.filter((item) => {
        if (activeSetFilter === 'Alle') return true;
        if (activeSetFilter === 'Matchday') return item.set.type === 'matchday';
        if (activeSetFilter === 'Club Season') return item.set.type === 'club_season';
        if (activeSetFilter === 'Stadium') return item.set.type === 'stadium';
        if (activeSetFilter === 'Moment') return item.set.type === 'moment';
        if (activeSetFilter === 'Special') return item.set.type === 'special' || item.set.type === 'origin';
        return true;
      }),
    [activeSetFilter, setProgressItems],
  );

  function selectSection(section: Section) {
    router.setParams({ section });
  }

  async function handleRemoveWantedCard(wantedCardId: string) {
    await removeWantedCard(wantedCardId).catch(() => undefined);
    setWantedCards((current) => current.filter((item) => item.wantedCard.id !== wantedCardId));
  }

  async function openWantedResult(result: CardSearchResult) {
    setSelectedWantedResult(result);
    const earnPaths = await getEarnPathsForTarget(result.target).catch(() => []);
    setSelectedWantedEarnPaths(earnPaths);
  }

  async function handleToggleWantedResult() {
    if (!selectedWantedResult || !userId) return;

    try {
      const toggleResult = await toggleWantedCard(wantedInputFromTarget(userId, selectedWantedResult.target));
      const refreshedWanted = await getWantedCards(userId);
      const wantedWithPaths = await Promise.all(
        refreshedWanted.map(async (wantedCard) => ({
          wantedCard,
          earnPaths: await getEarnPathsForWantedCard(wantedCard).catch(() => []),
        })),
      );
      setWantedCards(wantedWithPaths);
      
      // Update the selected result so the modal re-renders with new status
      setSelectedWantedResult(prev => prev ? { ...prev, wanted: toggleResult.wanted } : undefined);
    } catch (error) {
      console.error('Failed to toggle wanted status:', error);
    }
  }

  return (
    <CurvaoScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Cards</Text>
        <Text style={styles.copy}>Sammlung, gesuchte Ziele und deine Sets bleiben in einem Bereich.</Text>
      </View>

      <View style={styles.sectionTabs}>
        {sections.map((section) => (
          <Pressable
            key={section}
            onPress={() => selectSection(section)}
            style={[styles.sectionTab, activeSection === section && styles.sectionTabActive]}
          >
            <Text style={[styles.sectionTabLabel, activeSection === section && styles.sectionTabLabelActive]}>{section}</Text>
          </Pressable>
        ))}
      </View>

      {activeSection === 'Sammlung' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {filters.map((item) => (
              <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}>
                <Text style={[styles.filterLabel, filter === item && styles.activeFilterLabel]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.grid}>
            {visibleCards.map((card) => (
              <CardTile key={card.id} card={card} onPress={() => setSelected(card)} />
            ))}
          </View>
          {visibleCards.length === 0 ? <EmptyState title="Keine Cards in dieser Ansicht" /> : null}
        </>
      ) : null}

      {activeSection === 'Gesucht' ? (
        <View style={styles.stack}>
          <WantedSearchBar value={wantedQuery} onChangeText={setWantedQuery} />

          {wantedQuery.trim().length >= 2 ? (
            <View style={styles.stack}>
              {wantedResults.map((result) => (
                <WantedSearchResultTile key={result.id} result={result} onPress={() => void openWantedResult(result)} />
              ))}
              {!wantedLoading && wantedResults.length === 0 ? (
                <EmptyState title="Keine Cards gefunden" />
              ) : null}
            </View>
          ) : (
            <>
              {wantedCards.length > 0 ? (
                <View style={styles.stack}>
                  {wantedCards.map(({ wantedCard, earnPaths }) => (
                    <WantedCardTile
                      key={wantedCard.id}
                      wantedCard={wantedCard}
                      title={wantedCard.note || wantedCard.expand?.player?.displayName || wantedCard.expand?.club?.name || wantedCard.expand?.stadium?.name || wantedCard.expand?.match?.stadiumName || 'Wanted Card'}
                      subtitle={wantedCard.expand?.match ? `${wantedCard.expand.match.competition} · ${new Date(wantedCard.expand.match.kickoffAt).toLocaleDateString()}` : wantedCard.expand?.stadium?.city || wantedCard.expand?.club?.name || wantedCard.rarityTarget?.toUpperCase() || undefined}
                      earnPaths={earnPaths}
                      onRemove={() => void handleRemoveWantedCard(wantedCard.id)}
                      onPress={() => void openWantedResult(wantedCardToSearchResult(wantedCard, cards))}
                      onOpenSet={wantedCard.setId ? () => router.push(`/collection/set/${wantedCard.setId}`) : undefined}
                      onOpenMatch={wantedCard.matchId ? () => router.push(`/matches/${wantedCard.matchId}`) : undefined}
                    />
                  ))}
                </View>
              ) : (
                <WantedEmptyState onDiscover={() => router.setParams({ section: 'Gesucht' })} />
              )}
            </>
          )}
        </View>
      ) : null}

      {activeSection === 'Sets' ? (
        <View style={styles.stack}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {setFilters.map((item) => (
              <Pressable key={item} onPress={() => setActiveSetFilter(item)} style={[styles.filter, activeSetFilter === item && styles.activeFilter]}>
                <Text style={[styles.filterLabel, activeSetFilter === item && styles.activeFilterLabel]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {visibleSetProgressItems.map((item) => (
            <Pressable key={item.set.id} onPress={() => router.push(`/collection/set/${item.set.id}`)} style={styles.setCard}>
              <View style={styles.setTopRow}>
                <View style={styles.setCopy}>
                  <Text style={styles.setKicker}>{getSetTypeLabel(item.set.type)}</Text>
                  <Text style={styles.setTitle}>{item.set.title}</Text>
                  <Text style={styles.setSubtitle}>{item.set.subtitle || item.set.season || `${item.ownedSlots}/${item.totalSlots} Cards gesammelt`}</Text>
                </View>
                <Text style={styles.setPercent}>{Math.round(item.percent * 100)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(8, item.percent * 100)}%` }]} />
              </View>
              <Text style={styles.setMeta}>{item.ownedSlots}/{item.totalSlots} Cards gesammelt · {item.set.status?.toUpperCase() || 'ACTIVE'}</Text>
            </Pressable>
          ))}
          {visibleSetProgressItems.length === 0 ? <EmptyState title="Noch keine Sets verfügbar." /> : null}
        </View>
      ) : null}

      {activeSection === 'Archiv' ? (
        <View style={styles.stack}>
          <EmptyState title="Archiv folgt" />
        </View>
      ) : null}

      <CardDetailPanel card={selected} cards={visibleCards} onClose={() => setSelected(undefined)} />
      <WantedDetailModal
        earnPaths={selectedWantedEarnPaths}
        onClose={() => setSelectedWantedResult(undefined)}
        onOpenMatch={selectedWantedResult?.target.matchId ? () => router.push(`/matches/${selectedWantedResult.target.matchId}`) : undefined}
        onOpenSet={selectedWantedResult?.target.setId ? () => router.push(`/collection/set/${selectedWantedResult.target.setId}`) : undefined}
        onToggleWanted={() => void handleToggleWantedResult()}
        result={selectedWantedResult}
        visible={Boolean(selectedWantedResult)}
      />
    </CurvaoScreen>
  );
}

function getSetTypeLabel(type: CardSetProgress['set']['type']) {
  switch (type) {
    case 'matchday':
      return 'MATCHDAY SET';
    case 'club_season':
      return 'CLUB SEASON';
    case 'stadium':
      return 'STADIUM SET';
    case 'moment':
      return 'MOMENT SET';
    case 'origin':
    case 'special':
      return 'SPECIAL SET';
    default:
      return 'SET';
  }
}

const styles = StyleSheet.create({
  header: {
    gap: curvao.spacing.xs,
  },
  title: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.xxl,
    fontWeight: curvao.typography.weight.black,
  },
  copy: {
    color: curvao.colors.muted,
    lineHeight: 20,
  },
  sectionTabs: {
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    paddingBottom: 10,
    paddingTop: 2,
  },
  sectionTabActive: {
    borderBottomColor: curvao.colors.gold,
  },
  sectionTabLabel: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.black,
  },
  sectionTabLabelActive: {
    color: curvao.colors.text,
  },
  filters: {
    gap: curvao.spacing.sm,
    paddingRight: curvao.spacing.lg,
  },
  filter: {
    borderColor: curvao.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: curvao.spacing.sm,
    paddingVertical: 8,
  },
  activeFilter: {
    backgroundColor: curvao.colors.gold,
    borderColor: curvao.colors.gold,
  },
  filterLabel: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.bold,
  },
  activeFilterLabel: {
    color: curvao.colors.textInverted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: curvao.spacing.md,
  },
  stack: {
    gap: curvao.spacing.md,
  },
  setCard: {
    backgroundColor: 'rgba(18,22,20,0.9)',
    borderColor: 'rgba(216,170,77,0.20)',
    borderRadius: 8,
    borderWidth: 1,
    gap: curvao.spacing.md,
    padding: curvao.spacing.lg,
  },
  setTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: curvao.spacing.md,
    justifyContent: 'space-between',
  },
  setCopy: {
    flex: 1,
    gap: 4,
  },
  setKicker: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1.6,
  },
  setTitle: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.black,
  },
  setSubtitle: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.semiBold,
  },
  setMeta: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.bold,
  },
  setPercent: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.black,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: curvao.colors.gold,
    borderRadius: 999,
    height: '100%',
  },
});
