import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CardTile } from '@/src/components/CardTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { getCurrentUser } from '@/src/services/authService';
import { bindDuplicateToMain, getUserCards, setMainCard } from '@/src/services/cardService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

export default function DeckScreen() {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [mainCardId, setMainCardId] = useState<string>();
  const [duplicateId, setDuplicateId] = useState<string>();

  const load = useCallback(async () => {
    const user = await getCurrentUser();
    const allCards = await getUserCards(user.id);
    const playerCards = allCards.filter((card) => card.type === 'player');
    setCards(playerCards);
    setMainCardId(playerCards.find((card) => card.isMainCard)?.id);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const duplicateGroups = useMemo(() => {
    const groups = cards.reduce<Record<string, UserCard[]>>((result, card) => {
      const key = card.player ?? card.title;
      result[key] = [...(result[key] ?? []), card];
      return result;
    }, {});
    return Object.values(groups).filter((group) => group.length > 1);
  }, [cards]);

  const selectedMain = cards.find((card) => card.id === mainCardId);
  const bindableDuplicates = selectedMain
    ? cards.filter((card) => card.id !== selectedMain.id && card.player === selectedMain.player && !card.bound && !card.isMainCard)
    : [];

  async function handleSelectMain(card: UserCard) {
    try {
      await setMainCard(card.id);
      await load();
    } catch (error) {
      Alert.alert('Main Card', error instanceof Error ? error.message : 'Could not select Main Card.');
    }
  }

  async function handleBind() {
    if (!duplicateId || !mainCardId) return;
    try {
      await bindDuplicateToMain(duplicateId, mainCardId);
      setDuplicateId(undefined);
      await load();
    } catch (error) {
      Alert.alert('Binding failed', error instanceof Error ? error.message : 'Could not bind duplicate.');
    }
  }

  return (
    <CurvaoScreen>
      <Text style={styles.title}>Deck</Text>
      <Text style={styles.copy}>Choose a Main Card, bind duplicates, and grow Bond without deleting history.</Text>

      <Text style={styles.section}>Player Cards</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.id} style={styles.cardWrap}>
            <CardTile card={card} onPress={() => handleSelectMain(card)} fullWidth />
            {card.isMainCard ? <Text style={styles.marker}>MAIN CARD</Text> : null}
          </View>
        ))}
      </View>
      {cards.length === 0 ? <EmptyState title="No Player Cards yet" body="Check in to a match to earn play material." /> : null}

      <Text style={styles.section}>Duplicates</Text>
      {duplicateGroups.map((group) => (
        <View key={group[0].player ?? group[0].title} style={styles.group}>
          <Text style={styles.groupTitle}>{group[0].title}</Text>
          <Text style={styles.groupCopy}>{group.length} cards detected</Text>
        </View>
      ))}
      {duplicateGroups.length === 0 ? <EmptyState title="No duplicates yet" /> : null}

      <Text style={styles.section}>Bind Duplicate</Text>
      {selectedMain ? (
        <View style={styles.bindPanel}>
          <Text style={styles.groupTitle}>{selectedMain.title}</Text>
          <Text style={styles.groupCopy}>Bond XP {selectedMain.bondXp} | Level {selectedMain.bondLevel}</Text>
          <View style={styles.choices}>
            {bindableDuplicates.map((card) => (
              <Pressable key={card.id} onPress={() => setDuplicateId(card.id)} style={[styles.choice, duplicateId === card.id && styles.choiceActive]}>
                <Text style={[styles.choiceText, duplicateId === card.id && styles.choiceTextActive]}>#{card.editionNumber ?? card.id}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton label="Bind into Main Card" onPress={handleBind} disabled={!duplicateId} />
        </View>
      ) : (
        <EmptyState title="Select a Main Card" body="Tap an unbound Player Card to make it the Main Card." />
      )}
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
  section: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.heavy,
    marginTop: curvao.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: curvao.spacing.md,
  },
  cardWrap: {
    width: '48%',
  },
  marker: {
    color: curvao.colors.gold,
    fontSize: 11, // keep for micro copy
    fontWeight: curvao.typography.weight.black,
    marginTop: curvao.spacing.xs,
  },
  group: {
    backgroundColor: curvao.colors.surface,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderWidth: 1,
    padding: curvao.spacing.md,
  },
  groupTitle: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.md,
    fontWeight: curvao.typography.weight.heavy,
  },
  groupCopy: {
    color: curvao.colors.muted,
    marginTop: curvao.spacing.xs,
  },
  bindPanel: {
    backgroundColor: curvao.colors.surfaceElevated,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderWidth: 1,
    gap: curvao.spacing.md,
    padding: curvao.spacing.base,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: curvao.spacing.md,
  },
  choice: {
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.sm,
    borderWidth: 1,
    paddingHorizontal: curvao.spacing.sm,
    paddingVertical: curvao.spacing.md,
  },
  choiceActive: {
    backgroundColor: curvao.colors.gold,
    borderColor: curvao.colors.gold,
  },
  choiceText: {
    color: curvao.colors.text,
    fontWeight: curvao.typography.weight.bold,
  },
  choiceTextActive: {
    color: curvao.colors.textInverted,
  },
});
