import { GenericFallbackCardView } from '@/src/components/cards/GenericCardFrame';
import { MatchCardView } from '@/src/components/cards/MatchCardView';
import { PatchCardView } from '@/src/components/cards/PatchCardView';
import { PlayerCardView } from '@/src/components/cards/PlayerCardView';
import { StadiumCardView } from '@/src/components/cards/StadiumCardView';
import type { EarnPath } from '@/src/services/wantedCardService';
import type { UserCard } from '@/src/types/models';

type CardRendererProps = {
  card: UserCard;
  compact?: boolean;
  playerSize?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
  wantedState?: { isOwned: boolean; isWanted: boolean; onToggleWanted: () => void; };
  earnPaths?: EarnPath[];
};

export function CardRenderer({ card, compact, playerSize, isFlipped, wantedState, earnPaths }: CardRendererProps) {
  switch (card.type) {
    case 'match':
      return <MatchCardView card={card} compact={compact} size={playerSize} isFlipped={isFlipped} wantedState={wantedState} earnPaths={earnPaths} />;
    case 'player':
      return <PlayerCardView card={card} compact={compact} size={playerSize} isFlipped={isFlipped} wantedState={wantedState} earnPaths={earnPaths} />;
    case 'patch':
      return <PatchCardView card={card} compact={compact} />;
    case 'stadium':
      return <StadiumCardView card={card} compact={compact} size={playerSize} isFlipped={isFlipped} wantedState={wantedState} earnPaths={earnPaths} />;
    default:
      return <GenericFallbackCardView card={card} compact={compact} />;
  }
}
