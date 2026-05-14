import { StyleSheet, Text, View } from 'react-native';

import { GenericCardFrame } from '@/src/components/cards/GenericCardFrame';
import { getCardRelations } from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

export function StadiumCardView({ card, compact }: { card: UserCard; compact?: boolean }) {
  const { match, homeClub } = getCardRelations(card);
  const stadiumName = match?.stadiumName ?? card.title;
  const city = match?.stadiumCity ?? card.subtitle ?? 'Verified City';

  return (
    <GenericCardFrame card={card} compact={compact}>
      <View style={styles.body}>
        <View style={styles.stadiumMark}>
          <View style={styles.pitch} />
        </View>
        <Text style={styles.name} numberOfLines={2}>{stadiumName}</Text>
        <Text style={styles.city}>{city}</Text>
        <Text style={styles.club}>{homeClub?.name ?? 'Curvao Club'}</Text>
        <Text style={styles.visit}>First visit {new Date(card.acquiredAt).toLocaleDateString()}</Text>
      </View>
    </GenericCardFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  stadiumMark: {
    borderColor: curvao.colors.gold,
    borderRadius: 999,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    padding: 10,
    width: 110,
  },
  pitch: {
    borderColor: curvao.colors.greenBright,
    borderRadius: curvao.radius.sm,
    borderWidth: 1,
    flex: 1,
  },
  name: {
    color: curvao.colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
  },
  city: {
    color: curvao.colors.gold,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  club: {
    color: curvao.colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  visit: {
    color: curvao.colors.text,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 12,
  },
});
