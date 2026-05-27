import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { MatchLargeCard } from '@/src/components/cards/MatchLargeCard';
import { MatchCardPreview } from '@/src/components/cards/MatchCardPreview';
import { MatchHeroDetail } from '@/src/components/cards/match/MatchHeroDetail';
import type { UserCard } from '@/src/types/models';

type MatchCardViewProps = {
  card: UserCard;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
};

export function MatchCardView({ card, compact, size, isFlipped }: MatchCardViewProps) {
  const resolvedSize = size ?? (compact ? 'small' : 'large');

  if (compact || resolvedSize === 'small') {
    return <MatchCardPreview card={card} />;
  }

  if (resolvedSize === 'large' || resolvedSize === 'hero') {
    return <MatchHeroDetail card={card} />;
  }

  return <MatchLargeCard card={card} isFlipped={isFlipped} />;
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'visible',
  },
});
