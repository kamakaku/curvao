import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { MatchListCard } from '@/src/components/matches/MatchListCard';
import { MatchQuickTabs, type QuickTabValue } from '@/src/components/matches/MatchQuickTabs';
import { MatchSearchBar } from '@/src/components/matches/MatchSearchBar';
import { getCardSets } from '@/src/services/cardSetService';
import { getMatches } from '@/src/services/matchService';
import type { Match } from '@/src/types/models';
import { getTeamDisplay, getMatchViewState } from '@/src/utils/matchUtils';

type DerivedMatch = {
  match: Match;
  matchday: number | null;
  searchable: string;
};

const MATCHES_PER_MATCHDAY: Record<string, number> = {
  '1. Bundesliga': 9,
  '2. Bundesliga': 9,
  '3. Liga': 10,
};

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTab, setQuickTab] = useState<QuickTabValue>('all');
  const [matchdaySetMatchIds, setMatchdaySetMatchIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getMatches().then(setMatches);
    getCardSets({ type: 'matchday' }).then((sets) => {
      setMatchdaySetMatchIds(new Set(sets.map((set) => set.matchId).filter(Boolean) as string[]));
    });
  }, []);

  const derivedMatches = useMemo(() => deriveMatches(matches), [matches]);

  const filteredMatches = useMemo(
    () => derivedMatches.filter((item) => matchesSearch(item, searchQuery) && passesQuickTab(item.match, quickTab)),
    [derivedMatches, quickTab, searchQuery],
  );

  const resetFilters = () => {
    setSearchQuery('');
    setQuickTab('all');
  };

  return (
    <CurvaoScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>Finde Spiele, Rewards und Matchday Sets.</Text>
      </View>

      <View style={styles.controls}>
        <MatchSearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <MatchQuickTabs value={quickTab} onChange={setQuickTab} />
      </View>

      <View style={styles.list}>
        {filteredMatches.map(({ match, matchday }) => (
          <Link key={match.id} href={`/matches/${match.id}`} asChild>
            <MatchListCard
              hasMatchdaySet={matchdaySetMatchIds.has(match.id)}
              match={match}
              matchdayLabel={matchday ? `Spieltag ${matchday}` : undefined}
            />
          </Link>
        ))}

        {filteredMatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keine Matches gefunden.</Text>
            <Text style={styles.emptyCopy}>Passe deine Suche an oder setze die Ansicht zurück.</Text>
            <Pressable onPress={resetFilters} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Zurücksetzen</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </CurvaoScreen>
  );
}

function deriveMatches(matches: Match[]): DerivedMatch[] {
  const sorted = [...matches].sort((left, right) => new Date(left.kickoffAt).getTime() - new Date(right.kickoffAt).getTime());
  const grouped = new Map<string, Match[]>();

  for (const match of sorted) {
    const key = `${match.competition}|${match.season}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(match);
    grouped.set(key, bucket);
  }

  const matchdayMap = new Map<string, number | null>();
  for (const [key, group] of grouped.entries()) {
    const competition = key.split('|')[0];
    const perMatchday = MATCHES_PER_MATCHDAY[competition];
    group.forEach((match, index) => {
      matchdayMap.set(match.id, perMatchday ? Math.floor(index / perMatchday) + 1 : null);
    });
  }

  return sorted.map((match) => {
    const teams = getTeamDisplay(match);
    const stadiumLabel = normalizeStadiumName(match.stadiumName);

    return {
      match,
      matchday: matchdayMap.get(match.id) ?? null,
      searchable: [teams.homeName, teams.awayName, match.competition, stadiumLabel, `${teams.homeName} vs ${teams.awayName}`]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    };
  });
}

function matchesSearch(item: DerivedMatch, searchQuery: string) {
  if (!searchQuery.trim()) return true;
  return item.searchable.includes(searchQuery.trim().toLowerCase());
}

function passesQuickTab(match: Match, quickTab: QuickTabValue) {
  if (quickTab === 'all') return true;

  const kickoff = new Date(match.kickoffAt);
  const viewState = getMatchViewState(match);
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);

  if (quickTab === 'live') return viewState.status === 'live';
  if (quickTab === 'final') return viewState.status === 'final';
  if (quickTab === 'today') return isSameDay(kickoff, today);
  if (quickTab === 'tomorrow') return isSameDay(kickoff, tomorrow);
  if (quickTab === 'weekend') {
    const day = kickoff.getDay();
    return day === 6 || day === 0 || isSameDay(kickoff, dayAfterTomorrow);
  }

  return true;
}

function normalizeStadiumName(stadiumName?: string | null) {
  if (!stadiumName || stadiumName === 'Unknown Stadium') return '';
  return stadiumName;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 16,
  },
  title: {
    color: '#F4F1E8',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#A7A39A',
    fontSize: 13,
    lineHeight: 18,
  },
  controls: {
    gap: 12,
    marginBottom: 18,
  },
  list: {
    gap: 12,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.16)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: '#F4F1E8',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    color: '#A7A39A',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyButton: {
    alignItems: 'center',
    backgroundColor: '#D8AA4D',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    marginTop: 4,
    minWidth: 150,
    paddingHorizontal: 18,
  },
  emptyButtonText: {
    color: '#080A09',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
