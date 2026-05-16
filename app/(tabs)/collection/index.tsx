import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardDetailPanel } from '@/src/components/CardDetailPanel';
import { CardTile } from '@/src/components/CardTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { getCurrentUser } from '@/src/services/authService';
import { getUserCards } from '@/src/services/cardService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const filters = ['All', 'Match Cards', 'Player Cards', 'Stadium', 'Patch', 'Self-earned', 'Traded', 'Bound'] as const;
type Filter = (typeof filters)[number];

function matchesFilter(card: UserCard, filter: Filter) {
  switch (filter) {
    case 'Match Cards':
      return card.type === 'match';
    case 'Player Cards':
      return card.type === 'player';
    case 'Stadium':
      return card.origin === 'stadium_verified' || card.type === 'stadium';
    case 'Patch':
      return card.type === 'patch';
    case 'Self-earned':
      return card.origin === 'self_earned';
    case 'Traded':
      return card.origin === 'traded';
    case 'Bound':
      return card.bound;
    default:
      return true;
  }
}

export default function CollectionScreen() {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<UserCard>();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getCurrentUser()
        .then((user) => getUserCards(user.id))
        .then((items) => {
          if (mounted) setCards(items);
        });

      return () => {
        mounted = false;
      };
    }, []),
  );

  const visibleCards = cards.filter((card) => matchesFilter(card, filter));

  return (
    <CurvaoScreen>
      <Text style={styles.title}>Collection</Text>
      <Text style={styles.copy}>Archive-first inventory of every proof, card, bind, and upgrade.</Text>

      <View style={styles.filters}>
        {filters.map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}>
            <Text style={[styles.filterLabel, filter === item && styles.activeFilterLabel]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        {visibleCards.map((card) => <CardTile key={card.id} card={card} onPress={() => setSelected(card)} />)}
      </View>
      {visibleCards.length === 0 ? <EmptyState title="No cards match this filter" /> : null}
      <CardDetailPanel card={selected} cards={visibleCards} onClose={() => setSelected(undefined)} />
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.xxl,
    fontWeight: curvao.typography.weight.black,
  },
  copy: {
    color: curvao.colors.muted,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: curvao.spacing.md,
  },
  filter: {
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.sm,
    borderWidth: 1,
    paddingHorizontal: curvao.spacing.sm,
    paddingVertical: curvao.spacing.md,
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
});
