import { PlayerCardPreview } from '@/src/components/cards/PlayerCardPreview';
import { PlayerHeroDetail } from '@/src/components/cards/player/PlayerHeroDetail';
import { PlayerStandardCard } from '@/src/components/cards/PlayerStandardCard';
import { getClubCrestSource, getPlayerImageSource } from '@/src/services/cardAssetService';
import { getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import type { UserCard } from '@/src/types/models';

type PlayerCardViewProps = {
  card: UserCard;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isFlipped?: boolean;
};

export function PlayerCardView({ card, compact, size, isFlipped }: PlayerCardViewProps) {
  const { player, playerClub, match, homeClub, awayClub } = getCardRelations(card);
  const [fallbackFirstName = card.title, fallbackLastName = ''] = card.title.split(' ');
  const resolvedSize = size ?? (compact ? 'small' : 'large');
  const pocketBaseCrestUrl = getPocketBaseFileUrl(playerClub, playerClub?.crest);

  // Use specialized Preview component for compact views
  if (compact) {
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
      />
    );
  }

  const commonProps = {
    player: {
      firstName: player?.firstName ?? fallbackFirstName,
      lastName: player?.lastName ?? fallbackLastName,
      displayName: player?.displayName ?? card.title,
      position: player?.position ?? 'PLAYER',
      shirtNumber: player?.shirtNumber,
      nationality: player?.nationality,
      imageSource: getPlayerImageSource(player?.id),
    },
    club: {
      name: playerClub?.name ?? card.subtitle ?? 'Curvao Club',
      shortName: playerClub?.shortName,
      crestUrl: pocketBaseCrestUrl,
      crestSource: pocketBaseCrestUrl ? undefined : getClubCrestSource(playerClub?.id),
      primaryColor: playerClub?.primaryColor,
      secondaryColor: playerClub?.secondaryColor,
    },
    match: match
      ? {
          homeShortName: homeClub?.shortName,
          awayShortName: awayClub?.shortName,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          kickoffAt: match.kickoffAt,
        }
      : undefined,
    card: {
      rarity: card.rarity,
      editionNumber: card.editionNumber,
      editionSize: card.editionSize,
      origin: card.origin,
      bondLevel: card.bondLevel,
      archived: card.archived,
      tradable: card.tradable,
      bound: card.bound,
      seenLiveCount: card.stadiumVisitCount ?? 0,
      momentsCount: 0, // Placeholder for future data
      acquiredAt: card.acquiredAt,
    },
  };

  if (resolvedSize === 'hero') {
    return <PlayerHeroDetail card={card} />;
  }
  
  if (resolvedSize === 'large') {
    return <PlayerHeroDetail card={card} />;
  }

  return (
    <PlayerStandardCard
      size={resolvedSize}
      isFlipped={isFlipped}
      {...commonProps}
    />
  );
}
