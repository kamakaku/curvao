import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { MatchLargeCard } from '@/src/components/cards/MatchLargeCard';
import { MatchCardPreview } from '@/src/components/cards/MatchCardPreview';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

type MatchCardViewProps = {
  card: UserCard;
  compact?: boolean;
};

export function MatchCardView({ card, compact }: MatchCardViewProps) {
  if (!compact) {
    return <MatchLargeCard card={card} />;
  }

  return <MatchCardPreview card={card} />;
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'visible',
  },
});
