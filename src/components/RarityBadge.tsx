import { StyleSheet, Text } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
import type { Rarity } from '@/src/types/models';

const rarityColors: Record<Rarity, string> = {
  standard: '#7f8b84',
  rare: '#18a464',
  epic: '#7757d6',
  legendary: '#d6ad4b',
  oneoff: '#f5f1e8',
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return <Text style={[styles.badge, { borderColor: rarityColors[rarity], color: rarityColors[rarity] }]}>{rarity.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: curvao.radius.sm,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
