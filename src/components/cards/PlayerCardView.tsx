import { PlayerCardPreview } from '@/src/components/cards/PlayerCardPreview';
import { PlayerHeroDetail } from '@/src/components/cards/player/PlayerHeroDetail';
import { getCardRelations } from '@/src/services/cardTemplateService';
import type { UserCard } from '@/src/types/models';
import type { EarnPath } from '@/src/services/wantedCardService';

type PlayerCardViewProps = {
  card: UserCard;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
  wantedState?: { isOwned: boolean; isWanted: boolean; onToggleWanted: () => void; };
  earnPaths?: EarnPath[];
};

export function PlayerCardView({ card, compact, size, wantedState, earnPaths }: PlayerCardViewProps) {
  const { player, playerClub } = getCardRelations(card);
  const [fallbackFirstName = card.title, fallbackLastName = ''] = card.title.split(' ');
  const resolvedSize = size ?? (compact ? 'small' : 'large');

  // Use specialized Preview component for compact views
  if (compact || resolvedSize === 'small') {
    const displayPlayer = player || {
      id: 'unknown',
      lastName: fallbackLastName || fallbackFirstName,
      displayName: card.title,
      position: 'PLAYER',
      active: true,
      club: 'unknown'
    };

    const displayClub = playerClub || {
      id: 'unknown',
      name: card.subtitle || 'Curvao Club',
      shortName: 'CVO'
    };

    return (
      <PlayerCardPreview 
        card={card} 
        player={displayPlayer} 
        club={displayClub}
        size="compact"
      />
    );
  }

  // All non-compact variations (medium, large, hero) now use the unified Hero design.
  return <PlayerHeroDetail card={card} wantedState={wantedState} />;
}
