import { StyleSheet, View } from 'react-native';

import { MatchCardPreview } from '@/src/components/cards/MatchCardPreview';
import { MatchHeroDetail } from '@/src/components/cards/match/MatchHeroDetail';
import type { UserCard } from '@/src/types/models';
import type { EarnPath } from '@/src/services/wantedCardService';

type MatchCardViewProps = {
  card: UserCard;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
  wantedState?: { isOwned: boolean; isWanted: boolean; onToggleWanted: () => void; };
  earnPaths?: EarnPath[];
};

export function MatchCardView({ card, compact, size, wantedState, earnPaths }: MatchCardViewProps) {
  const resolvedSize = size ?? (compact ? 'small' : 'large');

  if (compact || resolvedSize === 'small') {
    return <MatchCardPreview card={card} />;
  }

  return <MatchHeroDetail card={card} wantedState={wantedState} />;
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'visible',
  },
});
