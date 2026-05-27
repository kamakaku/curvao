import { getClubName, getPlayers, getClubs, getStadiums, getMatches } from '@/src/services/matchService';
import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { Club, Match, Player, Rarity, Stadium, UserCard } from '@/src/types/models';

export type WantedTargetType = 'player' | 'match' | 'stadium' | 'special' | 'set' | 'club';

export type WantedCard = {
  id: string;
  userId: string;
  targetType: WantedTargetType;
  cardTemplateId?: string;
  playerId?: string;
  matchId?: string;
  stadiumId?: string;
  setId?: string;
  clubId?: string;
  season?: string;
  rarityTarget?: Rarity;
  createdAt: string;
  note?: string;
  expand?: {
    player?: Player;
    club?: Club;
    stadium?: Stadium;
    match?: Match;
  };
};

export type WantedCardInput = Omit<WantedCard, 'id' | 'createdAt' | 'expand'>;

export type WantedCardTarget = {
  targetType: WantedTargetType;
  cardTemplateId?: string;
  playerId?: string;
  matchId?: string;
  stadiumId?: string;
  setId?: string;
  clubId?: string;
  season?: string;
  rarityTarget?: Rarity;
  note?: string;
  player?: Player;
  club?: Club;
  stadium?: Stadium;
  match?: Match;
};

export type CardSearchResult = {
  id: string;
  type: 'player' | 'club' | 'stadium' | 'match' | 'set';
  title: string;
  subtitle: string;
  badge?: string;
  target: WantedCardTarget;
  owned: boolean;
  wanted: boolean;
};

export type EarnPath = {
  id: string;
  type: 'live_watch' | 'stadium_checkin' | 'set' | 'set_reward' | 'pack' | 'matchday' | 'trade';
  title: string;
  subtitle: string;
  available: boolean;
  route?: string;
  meta?: Record<string, unknown>;
};

type PocketBaseWantedCard = {
  id: string;
  user: string;
  targetType: WantedTargetType;
  cardTemplate?: string;
  player?: string;
  match?: string;
  stadium?: string;
  set?: string;
  club?: string;
  season?: string;
  rarityTarget?: Rarity;
  note?: string;
  created?: string;
};

function fromPocketBase(record: PocketBaseWantedCard & { expand?: any }): WantedCard {
  return {
    id: record.id,
    userId: record.user,
    targetType: record.targetType,
    cardTemplateId: record.cardTemplate,
    playerId: record.player,
    matchId: record.match,
    stadiumId: record.stadium,
    setId: record.set,
    clubId: record.club,
    season: record.season,
    rarityTarget: record.rarityTarget,
    note: record.note,
    createdAt: record.created ?? new Date().toISOString(),
    expand: record.expand,
  };
}

function toPocketBase(input: WantedCardInput) {
  return {
    user: input.userId,
    targetType: input.targetType,
    cardTemplate: input.cardTemplateId,
    player: input.playerId,
    match: input.matchId,
    stadium: input.stadiumId,
    set: input.setId,
    club: input.clubId,
    season: input.season,
    rarityTarget: input.rarityTarget,
    note: input.note,
  };
}

function getWantedKey(input: Pick<WantedCard, 'targetType' | 'cardTemplateId' | 'playerId' | 'matchId' | 'stadiumId' | 'setId'>) {
  return [
    input.targetType,
    input.cardTemplateId ?? '',
    input.playerId ?? '',
    input.matchId ?? '',
    input.stadiumId ?? '',
    input.setId ?? '',
  ].join(':');
}

function getTargetKey(input: Pick<WantedCardTarget, 'targetType' | 'cardTemplateId' | 'playerId' | 'matchId' | 'stadiumId' | 'setId' | 'clubId'>) {
  return [
    input.targetType,
    input.cardTemplateId ?? '',
    input.playerId ?? '',
    input.matchId ?? '',
    input.stadiumId ?? '',
    input.setId ?? '',
    input.clubId ?? '',
  ].join(':');
}

function matchesWantedTarget(card: UserCard, wanted: WantedCard) {
  if (wanted.cardTemplateId && card.template === wanted.cardTemplateId) return true;
  if (wanted.playerId && card.player === wanted.playerId) return true;
  if (wanted.matchId && card.match === wanted.matchId && wanted.targetType === card.type) return true;
  if (wanted.stadiumId && card.stadium === wanted.stadiumId) return true;
  if (wanted.targetType === card.type) {
    if (wanted.playerId || wanted.matchId || wanted.stadiumId || wanted.cardTemplateId) return false;
    return true;
  }
  return false;
}

export function isWantedTargetOwned(wantedCard: WantedCard, userCards: UserCard[]) {
  return userCards.some((card) => matchesWantedTarget(card, wantedCard));
}

export function isTargetOwned(target: WantedCardTarget, userCards: UserCard[]) {
  if (target.targetType === 'club' || target.targetType === 'set') return false;
  return isWantedTargetOwned({ ...target, id: 'target', userId: '', createdAt: new Date().toISOString() }, userCards);
}

export function isTargetWanted(target: WantedCardTarget, wantedCards: WantedCard[]) {
  return wantedCards.some((wantedCard) => getTargetKey(wantedCard) === getTargetKey(target));
}

export function wantedCardToMockUserCard(wantedCard: WantedCard): UserCard {
  return {
    id: `mock-${wantedCard.id}`,
    user: wantedCard.userId,
    type: wantedCard.targetType === 'player' ? 'player' : wantedCard.targetType === 'match' ? 'match' : wantedCard.targetType === 'stadium' ? 'stadium' : 'patch',
    title: wantedCard.expand?.player?.displayName || wantedCard.expand?.club?.name || 'Wanted Card',
    rarity: wantedCard.rarityTarget || 'standard',
    origin: 'self_earned',
    tradable: false,
    bound: false,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 1,
    acquiredAt: new Date().toISOString(),
    archived: false,
    favorite: false,
    player: wantedCard.playerId,
    match: wantedCard.matchId,
    stadium: wantedCard.stadiumId,
    expand: wantedCard.expand,
  };
}

export function wantedTargetToMockUserCard(target: WantedCardTarget): UserCard {
  return {
    id: `mock-${target.playerId || target.matchId || target.clubId || target.stadiumId || 'target'}`,
    user: 'mock',
    type: target.targetType === 'player' ? 'player' : target.targetType === 'match' ? 'match' : target.targetType === 'stadium' ? 'stadium' : 'patch',
    title: target.player?.displayName || target.club?.name || 'Wanted Card',
    rarity: target.rarityTarget || 'standard',
    origin: 'self_earned',
    tradable: false,
    bound: false,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 1,
    acquiredAt: new Date().toISOString(),
    archived: false,
    favorite: false,
    player: target.playerId,
    match: target.matchId,
    stadium: target.stadiumId,
    expand: {
      player: target.player ? { ...target.player, expand: { club: target.club } } as any : undefined,
      match: target.match ? { ...target.match, expand: { homeClub: target.club } } as any : undefined,
      stadium: target.stadium ? { ...target.stadium, expand: { club: target.club } } as any : undefined,
    },
  };
}

export function wantedInputFromTarget(userId: string, target: WantedCardTarget): WantedCardInput {
  return {
    userId,
    targetType: target.targetType,
    cardTemplateId: target.cardTemplateId,
    playerId: target.playerId,
    matchId: target.matchId,
    stadiumId: target.stadiumId,
    setId: target.setId,
    clubId: target.clubId,
    season: target.season,
    rarityTarget: target.rarityTarget,
    note: target.note,
  };
}

export async function getWantedCards(userId: string): Promise<WantedCard[]> {
  try {
    const records = await pb.collection('wanted_cards').getFullList<PocketBaseWantedCard>({
      filter: `user = "${userId}"`,
      sort: '-created',
      expand: 'player,club,stadium,match',
    });
    return records.map(fromPocketBase);
  } catch {
    return [];
  }
}

export async function addWantedCard(input: WantedCardInput): Promise<WantedCard> {
  return fromPocketBase(await pb.collection('wanted_cards').create<PocketBaseWantedCard>(toPocketBase(input)));
}

export async function removeWantedCard(wantedCardId: string): Promise<void> {
  await pb.collection('wanted_cards').delete(wantedCardId);
}

export async function isCardWanted(input: WantedCardInput): Promise<boolean> {
  const wantedCards = await getWantedCards(input.userId);
  return wantedCards.some((card) => getWantedKey(card) === getWantedKey(input));
}

export async function toggleWantedCard(input: WantedCardInput): Promise<{ wanted: boolean; wantedCard?: WantedCard }> {
  const wantedCards = await getWantedCards(input.userId);
  const existing = wantedCards.find((card) => getWantedKey(card) === getWantedKey(input));

  if (existing) {
    await removeWantedCard(existing.id);
    return { wanted: false };
  }

  const wantedCard = await addWantedCard(input);
  return { wanted: true, wantedCard };
}

export async function searchWantedTargets(query: string, userCards: UserCard[], wantedCards: WantedCard[]): Promise<CardSearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];

  const [players, clubs, stadiums, matches] = await Promise.all([
    getPlayers(),
    getClubs(),
    getStadiums(),
    getMatches(),
  ]);

  const playerResults: CardSearchResult[] = players
    .filter((player) => [player.displayName, player.firstName, player.lastName, player.position].filter(Boolean).some((value) => value!.toLowerCase().includes(normalizedQuery)))
    .slice(0, 8)
    .map((player) => {
      const club = clubs.find((item) => item.id === player.club);
      const season = '2025/26';
      const target: WantedCardTarget = {
        targetType: 'player',
        playerId: player.id,
        clubId: player.club,
        season,
        setId: `set_club_${player.club}_season_${season.replace('/', '-')}`,
        player,
        club,
      };
      return {
        id: `player-${player.id}`,
        type: 'player',
        title: player.displayName,
        subtitle: `Player Card · ${club?.name ?? 'Club'} ${season}`,
        badge: 'Player Card',
        target,
        owned: isTargetOwned(target, userCards),
        wanted: isTargetWanted(target, wantedCards),
      };
    });

  const clubResults: CardSearchResult[] = clubs
    .filter((club) => [club.name, club.shortName, club.city, club.country].filter(Boolean).some((value) => value!.toLowerCase().includes(normalizedQuery)))
    .slice(0, 6)
    .flatMap((club) => {
      const season = '2025/26';
      const setId = `set_club_${club.id}_season_${season.replace('/', '-')}`;
      const clubTarget: WantedCardTarget = { targetType: 'club', clubId: club.id, season, setId, club };
      const setTarget: WantedCardTarget = { targetType: 'set', clubId: club.id, season, setId, club };
      return [
        {
          id: `club-${club.id}`,
          type: 'club' as const,
          title: club.name,
          subtitle: `Club · ${club.city ?? 'Season'} ${season}`,
          badge: 'Club',
          target: clubTarget,
          owned: false,
          wanted: isTargetWanted(clubTarget, wantedCards),
        },
        {
          id: `set-${setId}`,
          type: 'set' as const,
          title: `${club.name} ${season}`,
          subtitle: 'Club Season Set',
          badge: 'Set',
          target: setTarget,
          owned: false,
          wanted: isTargetWanted(setTarget, wantedCards),
        },
      ];
    });

  const stadiumResults: CardSearchResult[] = stadiums
    .filter((stadium) => [stadium.name, stadium.city, stadium.country].filter(Boolean).some((value) => value!.toLowerCase().includes(normalizedQuery)))
    .slice(0, 6)
    .map((stadium) => {
      const club = clubs.find((c) => c.id === stadium.club);
      const target: WantedCardTarget = {
        targetType: 'stadium',
        stadiumId: stadium.id,
        clubId: stadium.club,
        stadium,
        club,
      };
      return {
        id: `stadium-${stadium.id}`,
        type: 'stadium',
        title: stadium.name,
        subtitle: `Stadium Card · ${stadium.city}`,
        badge: 'Stadium Card',
        target,
        owned: isTargetOwned(target, userCards),
        wanted: isTargetWanted(target, wantedCards),
      };
    });

  const matchResults: CardSearchResult[] = matches
    .filter((match) => {
      const homeClub = clubs.find((c) => c.id === match.homeClub);
      const awayClub = clubs.find((c) => c.id === match.awayClub);
      const homeName = homeClub?.name || 'Home';
      const awayName = awayClub?.name || 'Away';
      return [homeName, awayName, match.competition, match.stadiumName, match.stadiumCity, match.season].some((value) => value && value.toLowerCase().includes(normalizedQuery));
    })
    .slice(0, 8)
    .map((match) => {
      const homeClub = clubs.find((c) => c.id === match.homeClub);
      const awayClub = clubs.find((c) => c.id === match.awayClub);
      const target: WantedCardTarget = {
        targetType: 'match',
        matchId: match.id,
        clubId: match.homeClub,
        season: match.season,
        setId: `set_club_${match.homeClub}_season_${match.season.replace('/', '-')}`,
        match,
        club: homeClub,
      };
      return {
        id: `match-${match.id}`,
        type: 'match',
        title: `${homeClub?.shortName || homeClub?.name || 'Home'} vs ${awayClub?.shortName || awayClub?.name || 'Away'}`,
        subtitle: `Match Card · ${new Date(match.kickoffAt).toLocaleDateString('de-DE')}`,
        badge: 'Match Card',
        target,
        owned: isTargetOwned(target, userCards),
        wanted: isTargetWanted(target, wantedCards),
      };
    });

  return [...playerResults, ...clubResults, ...stadiumResults, ...matchResults];
}

export async function getEarnPathsForTarget(target: WantedCardTarget): Promise<EarnPath[]> {
  return getEarnPathsForWantedCard({
    ...wantedInputFromTarget('', target),
    id: 'target',
    createdAt: new Date().toISOString(),
    expand: {
      player: target.player,
      club: target.club,
      stadium: target.stadium,
      match: target.match,
    },
  });
}

export async function getEarnPathsForWantedCard(wantedCard: WantedCard): Promise<EarnPath[]> {
  const paths: EarnPath[] = [];
  const match = wantedCard.expand?.match || (wantedCard.matchId ? (await getMatches()).find((item) => item.id === wantedCard.matchId) : undefined);
  const setRoute = wantedCard.setId ? `/collection/set/${wantedCard.setId}` : undefined;

  if (wantedCard.targetType === 'player') {
    paths.push({
      id: 'live-watch',
      type: 'live_watch',
      title: 'Live Watch',
      subtitle: 'Beim nächsten passenden Match live dabei sein.',
      available: Boolean(match),
      route: match ? `/matches/${match.id}` : undefined,
    });
    paths.push({
      id: 'stadium-checkin',
      type: 'stadium_checkin',
      title: 'Stadium Check-in',
      subtitle: 'Im Stadion einchecken und Verified Rewards verdienen.',
      available: Boolean(match),
      route: match ? `/matches/${match.id}` : undefined,
    });
  }

  if (wantedCard.targetType === 'club') {
    paths.push({
      id: 'club-set',
      type: 'set',
      title: 'Club Season Set',
      subtitle: 'Alle Cards dieser Saison ansehen.',
      available: Boolean(setRoute),
      route: setRoute,
    });
    paths.push({
      id: 'upcoming-matches',
      type: 'matchday',
      title: 'Upcoming Matches',
      subtitle: 'Passende Matches finden und Earn-Wege prüfen.',
      available: true,
    });
  }

  if (wantedCard.targetType === 'set') {
    paths.push({
      id: 'open-set',
      type: 'set',
      title: 'Set öffnen',
      subtitle: 'Fehlende Cards ansehen und Fortschritt machen.',
      available: Boolean(setRoute),
      route: setRoute,
    });
  }

  if (wantedCard.targetType === 'match') {
    paths.push({
      id: 'matchday',
      type: 'matchday',
      title: 'Matchday Reward',
      subtitle: 'Dieses Match über Live Watch oder Stadium Check-in verdienen.',
      available: Boolean(match),
      route: match ? `/matches/${match.id}` : undefined,
    });
  }

  if (wantedCard.targetType === 'stadium') {
    paths.push({
      id: 'stadium-checkin',
      type: 'stadium_checkin',
      title: 'Stadium Check-in',
      subtitle: 'Ein Match in diesem Stadion besuchen.',
      available: true,
      route: match ? `/matches/${match.id}` : undefined,
    });
  }

  paths.push({
    id: 'set-reward',
    type: 'set_reward',
    title: 'Zum Set',
    subtitle: wantedCard.setId ? 'Diese Card gehört zu einem Set.' : 'Passendes Set prüfen.',
    available: Boolean(setRoute),
    route: setRoute,
  });

  paths.push({
    id: 'pack',
    type: 'pack',
    title: 'Pack möglich',
    subtitle: 'Kann in passenden Packs enthalten sein. Keine Garantie.',
    available: false,
  });

  return paths;
}
