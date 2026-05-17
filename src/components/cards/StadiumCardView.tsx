import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { StadiumLargeCard } from '@/src/components/cards/StadiumLargeCard';
import { StadiumCardPreview } from '@/src/components/cards/StadiumCardPreview';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

export function StadiumCardView({ card, compact }: { card: UserCard; compact?: boolean }) {
  if (!compact) {
    return <StadiumLargeCard card={card} />;
  }

  return <StadiumCardPreview card={card} />;
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 987 / 1414.5,
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'visible',
    position: 'relative',
    width: '100%',
  },
});