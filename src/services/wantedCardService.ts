import { getPlayers, getClubs, getStadiums, getMatches } from '@/src/services/matchService';
import { pb } from '@/src/services/pocketbase';
import type { CardTemplate, Club, Match, Player, Rarity, Stadium, UserCard } from '@/src/types/models';

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
  type: 'player' | 'stadium' | 'match' | 'club' | 'special';
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

type SearchEntry = CardSearchResult & { score: number };

function getWantedCreatedAt(record: PocketBaseWantedCard | WantedCard) {
  return ('createdAt' in record ? record.createdAt : record.created) ?? '';
}

function sortWantedCardsNewestFirst<T extends WantedCard>(items: T[]) {
  return [...items].sort((a, b) => getWantedCreatedAt(b).localeCompare(getWantedCreatedAt(a)));
}

function fromPocketBase(record: PocketBaseWantedCard & { expand?: any }): WantedCard {
  return {
    id: record.id,
    userId: record.user || (record as any).userId || (record as any).user_id,
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
    input.targetType === 'special' ? (input.cardTemplateId ?? '') : '',
    input.targetType === 'player' ? (input.playerId ?? '') : '',
    input.targetType === 'match' ? (input.matchId ?? '') : '',
    input.targetType === 'stadium' ? (input.stadiumId ?? '') : '',
    input.targetType === 'set' ? (input.setId ?? '') : '',
    input.targetType === 'club' ? ((input as WantedCard).clubId ?? '') : '',
  ].join(':');
}

function getTargetKey(input: Pick<WantedCardTarget, 'targetType' | 'cardTemplateId' | 'playerId' | 'matchId' | 'stadiumId' | 'setId' | 'clubId'>) {
  return [
    input.targetType,
    input.targetType === 'special' ? (input.cardTemplateId ?? '') : '',
    input.targetType === 'player' ? (input.playerId ?? '') : '',
    input.targetType === 'match' ? (input.matchId ?? '') : '',
    input.targetType === 'stadium' ? (input.stadiumId ?? '') : '',
    input.targetType === 'set' ? (input.setId ?? '') : '',
    input.targetType === 'club' ? (input.clubId ?? '') : '',
  ].join(':');
}

function matchesWantedTarget(card: UserCard, wanted: WantedCard) {
  if (wanted.cardTemplateId && card.template === wanted.cardTemplateId) return true;
  if (wanted.playerId && card.player === wanted.playerId) return true;
  if (wanted.matchId && card.match === wanted.matchId && wanted.targetType === card.type) return true;
  if (wanted.stadiumId && card.stadium === wanted.stadiumId) return true;
  if (wanted.clubId && (card.club === wanted.clubId || card.expand?.club?.id === wanted.clubId) && wanted.targetType === card.type) return true;
  if (wanted.targetType === card.type) {
    if (wanted.playerId || wanted.matchId || wanted.stadiumId || wanted.clubId || wanted.cardTemplateId) return false;
    return true;
  }
  return false;
}

function searchScore(fields: (string | undefined | null)[], query: string) {
  let score = 0;
  for (const raw of fields) {
    if (!raw) continue;
    const value = raw.toLowerCase();
    if (value === query) score += 120;
    else if (value.startsWith(query)) score += 80;
    else if (value.includes(query)) score += 40;
  }
  return score;
}

function getTemplateBadge(template: CardTemplate) {
  switch (template.type) {
    case 'moment':
      return 'Moment Card';
    case 'patch':
      return 'Patch Card';
    case 'season':
      return 'Season Card';
    case 'match':
      return 'Match Card';
    case 'stadium':
      return 'Stadium Card';
    case 'player':
      return 'Player Card';
    case 'club':
      return 'Club Card';
    default:
      return 'Special Card';
  }
}

async function getActiveCardTemplates() {
  try {
    return await pb.collection('card_templates').getFullList<CardTemplate>({
      filter: 'active = true',
      sort: 'name',
    });
  } catch {
    return [];
  }
}

export function isWantedTargetOwned(wantedCard: WantedCard, userCards: UserCard[]) {
  return userCards.some((card) => matchesWantedTarget(card, wantedCard));
}

export function isTargetOwned(target: WantedCardTarget, userCards: UserCard[]) {
  if (target.targetType === 'set') return false;
  return isWantedTargetOwned({ ...target, id: 'target', userId: '', createdAt: new Date().toISOString() }, userCards);
}

export function isTargetWanted(target: WantedCardTarget, wantedCards: WantedCard[]) {
  return wantedCards.some((wantedCard) => getTargetKey(wantedCard) === getTargetKey(target));
}

export function wantedCardToSearchResult(wantedCard: WantedCard, userCards: UserCard[]): CardSearchResult {
  const type = wantedCard.targetType === 'player'
    ? 'player'
    : wantedCard.targetType === 'match'
      ? 'match'
      : wantedCard.targetType === 'stadium'
        ? 'stadium'
        : wantedCard.targetType === 'club'
          ? 'club'
          : 'special';
  const target: WantedCardTarget = {
    targetType: wantedCard.targetType,
    cardTemplateId: wantedCard.cardTemplateId,
    playerId: wantedCard.playerId,
    matchId: wantedCard.matchId,
    stadiumId: wantedCard.stadiumId,
    setId: wantedCard.setId,
    clubId: wantedCard.clubId,
    season: wantedCard.season,
    rarityTarget: wantedCard.rarityTarget,
    player: wantedCard.expand?.player,
    club: wantedCard.expand?.club || wantedCard.expand?.player?.expand?.club,
    stadium: wantedCard.expand?.stadium,
    match: wantedCard.expand?.match,
  };

  return {
    id: wantedCard.id,
    type,
    title: wantedCard.note || wantedCard.expand?.player?.displayName || wantedCard.expand?.club?.name || wantedCard.expand?.stadium?.name || wantedCard.expand?.match?.stadiumName || 'Wanted Card',
    subtitle: wantedCard.expand?.match ? `${wantedCard.expand.match.competition} · ${new Date(wantedCard.expand.match.kickoffAt).toLocaleDateString()}` : wantedCard.expand?.stadium?.city || wantedCard.expand?.club?.name || wantedCard.rarityTarget?.toUpperCase() || 'Details',
    target,
    owned: isTargetOwned(target, userCards),
    wanted: true,
  };
}

export function wantedCardToMockUserCard(wantedCard: WantedCard): UserCard {
  return {
    id: `mock-${wantedCard.id}`,
    user: wantedCard.userId,
    type: wantedCard.targetType === 'player' ? 'player' : wantedCard.targetType === 'match' ? 'match' : wantedCard.targetType === 'stadium' ? 'stadium' : wantedCard.targetType === 'club' ? 'club' : 'patch',
    title: wantedCard.note || wantedCard.expand?.player?.displayName || wantedCard.expand?.club?.name || 'Wanted Card',
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
    template: wantedCard.cardTemplateId,
    player: wantedCard.playerId,
    match: wantedCard.matchId,
    club: wantedCard.clubId,
    stadium: wantedCard.stadiumId,
    expand: wantedCard.expand,
  };
}

export function wantedTargetToMockUserCard(target: WantedCardTarget): UserCard {
  return {
    id: `mock-${target.cardTemplateId || target.playerId || target.matchId || target.clubId || target.stadiumId || 'target'}`,
    user: 'mock',
    type: target.targetType === 'player' ? 'player' : target.targetType === 'match' ? 'match' : target.targetType === 'stadium' ? 'stadium' : target.targetType === 'club' ? 'club' : 'patch',
    title: target.note || target.player?.displayName || target.club?.name || 'Wanted Card',
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
    template: target.cardTemplateId,
    player: target.playerId,
    match: target.matchId,
    club: target.clubId,
    stadium: target.stadiumId,
    expand: {
      club: target.club,
      player: target.player ? ({ ...target.player, expand: { club: target.club } } as any) : undefined,
      match: target.match ? ({ ...target.match, expand: { homeClub: target.club } } as any) : undefined,
      stadium: target.stadium ? ({ ...target.stadium, expand: { club: target.club } } as any) : undefined,
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
  if (!userId) return [];
  
  try {
    // 1. Primary attempt: Standard filtered fetch without server-side sort
    const records = await pb.collection('wanted_cards').getFullList<PocketBaseWantedCard>({
      filter: `user = "${userId}"`,
      expand: 'player,player.club,stadium,match,match.homeClub,match.awayClub',
      requestKey: null,
    });
    return sortWantedCardsNewestFirst(records.map(fromPocketBase));
  } catch (error: any) {
    console.warn('[WantedCardService] Filtered fetch failed, trying fallback fetch...', error.message);
    
    try {
      // 2. Fallback: Fetch everything (limited to 500) and filter locally
      // This works even if the 'user' field is not filterable via API
      const result = await pb.collection('wanted_cards').getList<PocketBaseWantedCard>(1, 500, {
          expand: 'player,player.club,stadium,match,match.homeClub,match.awayClub',
          requestKey: null,
      });
      
      const filtered = result.items.filter(item => {
        const u = item.user || (item as any).userId || (item as any).user_id;
        return u === userId || (u && typeof u === 'object' && u.id === userId);
      });
      
      return sortWantedCardsNewestFirst(filtered.map(fromPocketBase));
    } catch {
      console.error('[WantedCardService] All fetch attempts failed.');
      return [];
    }
  }
}

export async function addWantedCard(input: WantedCardInput): Promise<WantedCard> {
  const record = await pb.collection('wanted_cards').create<PocketBaseWantedCard>(toPocketBase(input));
  console.log('[WantedCardService] Created record:', JSON.stringify(record));
  return fromPocketBase(record);
}

export async function removeWantedCard(wantedCardId: string): Promise<void> {
  await pb.collection('wanted_cards').delete(wantedCardId);
}

export async function isCardWanted(input: WantedCardInput): Promise<boolean> {
  const wantedCards = await getWantedCards(input.userId);
  return wantedCards.some((card) => getWantedKey(card) === getWantedKey(input));
}

export async function toggleWantedCard(input: WantedCardInput): Promise<{ wanted: boolean; wantedCard?: WantedCard }> {
  let wantedCards: WantedCard[] = [];
  try {
    wantedCards = await getWantedCards(input.userId);
  } catch {
    console.warn('[WantedCardService] Could not fetch existing wanted cards, proceeding with create attempt.');
  }
  
  const existing = wantedCards.find((card) => getWantedKey(card) === getWantedKey(input));

  if (existing) {
    try {
      await removeWantedCard(existing.id);
      return { wanted: false };
    } catch (error) {
      console.error('[WantedCardService] Failed to remove wanted card:', error);
      throw error;
    }
  }

  try {
    const wantedCard = await addWantedCard(input);
    return { wanted: true, wantedCard };
  } catch (error: any) {
    console.error('[WantedCardService] Failed to add wanted card. Schema mismatch suspected:', error.message, error.data);
    throw error;
  }
}

export async function searchWantedTargets(query: string, userCards: UserCard[], wantedCards: WantedCard[]): Promise<CardSearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];

  const [players, clubs, stadiums, matches, templates] = await Promise.all([
    getPlayers(),
    getClubs(),
    getStadiums(),
    getMatches(),
    getActiveCardTemplates(),
  ]);

  const clubMap = new Map(clubs.map((club) => [club.id, club]));

  const playerResults: SearchEntry[] = players
    .map((player) => {
      const club = clubMap.get(player.club);
      const score = searchScore([player.displayName, player.firstName, player.lastName, player.position, club?.name, club?.shortName], normalizedQuery);
      if (score === 0) return null;

      const target: WantedCardTarget = {
        targetType: 'player',
        playerId: player.id,
        clubId: player.club,
        season: '2025/2026',
        player,
        club,
      };

      return {
        id: `player-${player.id}`,
        type: 'player',
        title: player.displayName,
        subtitle: `Player Card · ${club?.name ?? 'Club'}${player.position ? ` · ${player.position}` : ''}`,
        badge: 'Player Card',
        target,
        owned: isTargetOwned(target, userCards),
        wanted: isTargetWanted(target, wantedCards),
        score: score + 30,
      };
    })
    .filter((item) => item !== null) as SearchEntry[];

  const stadiumResults: SearchEntry[] = stadiums
    .map((stadium) => {
      const club = stadium.club ? clubMap.get(stadium.club) : undefined;
      const score = searchScore([stadium.name, stadium.city, stadium.country, club?.name, club?.shortName], normalizedQuery);
      if (score === 0) return null;

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
        subtitle: `Stadium Card${stadium.city ? ` · ${stadium.city}` : ''}`,
        badge: 'Stadium Card',
        target,
        owned: isTargetOwned(target, userCards),
        wanted: isTargetWanted(target, wantedCards),
        score: score + 20,
      };
    })
    .filter((item) => item !== null) as SearchEntry[];

  const clubResults: SearchEntry[] = clubs
    .map((club) => {
      const score = searchScore([club.name, club.shortName, club.city, club.country], normalizedQuery);
      if (score === 0) return null;

      const target: WantedCardTarget = {
        targetType: 'club',
        clubId: club.id,
        club,
      };

      return {
        id: `club-${club.id}`,
        type: 'club',
        title: club.name,
        subtitle: `Club Card${club.city ? ` · ${club.city}` : ''}`,
        badge: 'Club Card',
        target,
        owned: isTargetOwned(target, userCards),
        wanted: isTargetWanted(target, wantedCards),
        score: score + 22,
      };
    })
    .filter((item) => item !== null) as SearchEntry[];

  const matchResults: SearchEntry[] = matches
    .map((match) => {
      const homeClub = clubMap.get(match.homeClub);
      const awayClub = clubMap.get(match.awayClub);
      const homeName = homeClub?.name || 'Home';
      const awayName = awayClub?.name || 'Away';
      const score = searchScore(
        [homeName, awayName, homeClub?.shortName, awayClub?.shortName, match.competition, match.stadiumName, match.stadiumCity, match.season, `${homeName} vs ${awayName}`],
        normalizedQuery,
      );
      if (score === 0) return null;

      const target: WantedCardTarget = {
        targetType: 'match',
        matchId: match.id,
        clubId: match.homeClub,
        season: match.season,
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
        score: score + 25,
      };
    })
    .filter((item) => item !== null) as SearchEntry[];

  const templateResults: SearchEntry[] = templates
    .map((template) => {
      if (template.type === 'club') return null;
      const score = searchScore([template.name, template.type, template.rarity, template.description], normalizedQuery);
      if (score === 0) return null;

      const target: WantedCardTarget = {
        targetType: 'special',
        cardTemplateId: template.id,
        rarityTarget: template.rarity,
        note: template.name,
      };

      return {
        id: `template-${template.id}`,
        type: 'special',
        title: template.name,
        subtitle: `${getTemplateBadge(template)} · ${template.rarity.toUpperCase()}`,
        badge: getTemplateBadge(template),
        target,
        owned: isTargetOwned(target, userCards),
        wanted: isTargetWanted(target, wantedCards),
        score: score + 10,
      };
    })
    .filter((item) => item !== null) as SearchEntry[];

  return [...playerResults, ...clubResults, ...stadiumResults, ...matchResults, ...templateResults]
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, 'de'))
    .map(({ score: _score, ...result }) => result);
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

  if (wantedCard.targetType === 'special') {
    paths.push({
      id: 'special-pack',
      type: 'pack',
      title: 'Reward Package',
      subtitle: 'Kann über Rewards oder spezielle Matchday-Pfade verfügbar werden. Keine Garantie.',
      available: false,
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
    subtitle: 'Kann in passenden Rewards enthalten sein. Keine Garantie.',
    available: false,
  });

  return paths;
}
