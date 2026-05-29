import { StyleSheet } from 'react-native';
import { StadiumCardPreview } from '@/src/components/cards/StadiumCardPreview';
import { StadiumHeroDetail } from '@/src/components/cards/stadium/StadiumHeroDetail';
import type { UserCard } from '@/src/types/models';
import type { EarnPath } from '@/src/services/wantedCardService';

type StadiumCardViewProps = {
  card: UserCard;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
  wantedState?: { isOwned: boolean; isWanted: boolean; onToggleWanted: () => void; };
  earnPaths?: EarnPath[];
};

export function StadiumCardView({ card, compact, size, wantedState, earnPaths }: StadiumCardViewProps) {
  const resolvedSize = size ?? (compact ? 'small' : 'large');

  if (compact || resolvedSize === 'small') {
    return <StadiumCardPreview card={card} />;
  }

  return <StadiumHeroDetail card={card} wantedState={wantedState} earnPaths={earnPaths} />;
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