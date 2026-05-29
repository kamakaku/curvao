import { StyleSheet } from 'react-native';
import { StadiumLargeCard } from '@/src/components/cards/StadiumLargeCard';
import { StadiumCardPreview } from '@/src/components/cards/StadiumCardPreview';
import { StadiumHeroDetail } from '@/src/components/cards/stadium/StadiumHeroDetail';
import type { UserCard } from '@/src/types/models';

type StadiumCardViewProps = {
  card: UserCard;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
};

export function StadiumCardView({ card, compact, size, isFlipped }: StadiumCardViewProps) {
  const resolvedSize = size ?? (compact ? 'small' : 'large');

  if (compact || resolvedSize === 'small') {
    return <StadiumCardPreview card={card} />;
  }

  // Large version (from Stadium detail modal etc)
  if (resolvedSize === 'large' || resolvedSize === 'hero') {
    return <StadiumHeroDetail card={card} />;
  }

  // Medium or other (Framed version)
  return <StadiumLargeCard card={card} isFlipped={isFlipped} />;
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 987 / 1414.5,
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'visible',
    position: 'relative',
    width: '100%',
  },
});