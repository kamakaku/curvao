import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import type { Club } from '@/src/types/models';
import type { ImageSourcePropType } from 'react-native';

const playerImageSources: Record<string, ImageSourcePropType> = {
  playerreese0001: require('@/assets/cards/fabian_reese_cutout_v2.png'),
};

const clubCrestSources: Record<string, ImageSourcePropType> = {
  clubhertha00001: require('@/assets/cards/hertha_crest.png'),
};

const playerPlaceholder = require('@/assets/cards/player_placholder.png');
const curvaoCrestFallback = require('@/assets/logo_crest.png');

export function getPlayerImageSource(playerId?: string) {
  return (playerId ? playerImageSources[playerId] : undefined) ?? playerPlaceholder;
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
