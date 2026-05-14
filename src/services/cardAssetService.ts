import type { ImageSourcePropType } from 'react-native';

const playerImageSources: Record<string, ImageSourcePropType> = {
  playerreese0001: require('@/assets/cards/fabian_reese_cutout_v2.png'),
};

const clubCrestSources: Record<string, ImageSourcePropType> = {
  clubhertha00001: require('@/assets/cards/hertha_crest.png'),
};

export function getPlayerImageSource(playerId?: string) {
  return playerId ? playerImageSources[playerId] : undefined;
}

export function getClubCrestSource(clubId?: string) {
  return clubId ? clubCrestSources[clubId] : undefined;
}
