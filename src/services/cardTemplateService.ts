import type { CardOrigin, CardType, Rarity, UserCard } from '@/src/types/models';

export type CardVisualConfig = {
  accentColor: string;
  borderColor: string;
  backgroundColor: string;
  badgeLabel: string;
  frameLabel: string;
};

export const rarityConfig: Record<Rarity, Pick<CardVisualConfig, 'accentColor' | 'borderColor' | 'frameLabel'>> = {
  standard: {
    accentColor: '#9ca89f',
    borderColor: '#34463c',
    frameLabel: 'Standard Frame',
  },
  rare: {
    accentColor: '#18a464',
    borderColor: '#18a464',
    frameLabel: 'Rare Green Frame',
  },
  epic: {
    accentColor: '#8b6cf0',
    borderColor: '#8b6cf0',
    frameLabel: 'Epic Night Frame',
  },
  legendary: {
    accentColor: '#d6ad4b',
    borderColor: '#d6ad4b',
    frameLabel: 'Legendary Gold Frame',
  },
  oneoff: {
    accentColor: '#f5f1e8',
    borderColor: '#f5f1e8',
    frameLabel: 'One-Off Proof Frame',
  },
};

const typeLabels: Record<CardType, string> = {
  match: 'Match Card',
  player: 'Player Card',
  patch: 'Patch',
  stadium: 'Stadium',
  moment: 'Moment',
  season: 'Season',
};

const originLabels: Record<CardOrigin, string> = {
  self_earned: 'Self-earned',
  stadium_verified: 'Stadium Verified',
  logged_viewing: 'Logged Viewing',
  traded: 'Traded',
  club_drop: 'Club Drop',
  event_drop: 'Event Drop',
  gifted: 'Gifted',
  bound: 'Bound',
  starter_pack: 'Starter Pack',
  fan_claimed: 'Fan Claimed',
  live_verified: 'Live Verified',
  special_moment: 'Special Moment',
  club_reward: 'Club Reward',
  season_reward: 'Season Reward',
};

const rarityLabels: Record<Rarity, string> = {
  standard: 'STANDARD',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
  oneoff: 'ONE-OFF',
};

const originUpperLabels: Record<CardOrigin, string> = {
  self_earned: 'SELF EARNED',
  stadium_verified: 'STADIUM VERIFIED',
  logged_viewing: 'LOGGED VIEWING',
  traded: 'TRADED',
  club_drop: 'CLUB DROP',
  event_drop: 'EVENT DROP',
  gifted: 'GIFTED',
  bound: 'BOUND',
  starter_pack: 'STARTER PACK',
  fan_claimed: 'FAN CLAIMED',
  live_verified: 'LIVE VERIFIED',
  special_moment: 'SPECIAL MOMENT',
  club_reward: 'CLUB REWARD',
  season_reward: 'SEASON REWARD',
};

export function getCardVisualConfig(card: Pick<UserCard, 'type' | 'rarity'>): CardVisualConfig {
  const rarity = rarityConfig[card.rarity];

  return {
    ...rarity,
    backgroundColor: '#101713',
    badgeLabel: typeLabels[card.type] ?? 'Card',
  };
}

export function formatCardOrigin(origin: CardOrigin) {
  return originLabels[origin] ?? origin;
}

export function formatRarity(rarity: Rarity) {
  return rarityLabels[rarity] ?? rarity.toUpperCase();
}

export function formatOrigin(origin: CardOrigin) {
  return originUpperLabels[origin] ?? origin.toUpperCase();
}

export function formatEdition(
  editionNumberOrCard?: number | Pick<UserCard, 'editionNumber' | 'editionSize'>,
  editionSize?: number,
) {
  const editionNumber = typeof editionNumberOrCard === 'object' ? editionNumberOrCard.editionNumber : editionNumberOrCard;
  const resolvedEditionSize = typeof editionNumberOrCard === 'object' ? editionNumberOrCard.editionSize : editionSize;

  if (!editionNumber) {
    return typeof editionNumberOrCard === 'object' ? 'Open edition' : '-';
  }

  if (typeof editionNumberOrCard === 'object') {
    return resolvedEditionSize ? `#${editionNumber} / ${resolvedEditionSize}` : `#${editionNumber}`;
  }

  return resolvedEditionSize ? `${editionNumber} / ${resolvedEditionSize}` : `${editionNumber}`;
}

export function formatMatch(match?: {
  homeShortName?: string;
  awayShortName?: string;
  homeScore?: number;
  awayScore?: number;
}) {
  if (
    match?.homeShortName &&
    match.awayShortName &&
    match.homeScore !== undefined &&
    match.awayScore !== undefined
  ) {
    return `${match.homeShortName} ${match.homeScore}:${match.awayScore} ${match.awayShortName}`;
  }

  return 'MATCHDAY';
}

export function getCardRelations(card: UserCard) {
  const player = card.expand?.player;
  const match = card.expand?.match;
  const stadium = card.expand?.stadium ?? match?.expand?.stadium;
  const homeClub = card.expand?.match?.expand?.homeClub;
  const awayClub = card.expand?.match?.expand?.awayClub;
  const playerClub = card.expand?.player?.expand?.club;
  const stadiumClub = stadium?.expand?.club;

  return {
    player,
    match,
    stadium,
    homeClub,
    awayClub,
    playerClub,
    stadiumClub,
  };
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
