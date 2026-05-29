import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import { getPlayerCutoutSource } from '@/src/services/playerCutoutService';
import type { Club, Player } from '@/src/types/models';
import type { ImageSourcePropType } from 'react-native';

const clubCrestSources: Record<string, ImageSourcePropType> = {
  clubhertha00001: require('@/assets/cards/hertha_crest.png'),
};

const curvaoCrestFallback = require('@/assets/logo_crest.png');

export function getPlayerImageSource(playerId?: string) {
  return getPlayerCutoutSource({ playerId, variant: 'hero' });
}

export function getPlayerCardImageSource(player?: string | Player) {
  if (player && typeof player === 'object') {
    return getPlayerCutoutSource({
      playerId: player.id,
      displayName: player.displayName,
      position: player.position,
      variant: 'hero',
    });
  }

  return getPlayerCutoutSource({ playerId: player, variant: 'hero' });
}

export function getClubCrestSource(club?: string | Club) {
  if (club && typeof club === 'object') {
    const crestUrl = getPocketBaseFileUrl(club, club.crest);
    if (crestUrl) {
      return { uri: crestUrl };
    }

    return clubCrestSources[club.id] ?? curvaoCrestFallback;
  }

  return (club ? clubCrestSources[club] : undefined) ?? curvaoCrestFallback;
}
