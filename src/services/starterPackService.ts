import { checkAchievements } from '@/src/services/achievementService';
import { getMatches, getPlayers, getStadiums } from '@/src/services/matchService';
import { pb } from '@/src/services/pocketbase';
import type { Match, Player, Stadium, UserCard } from '@/src/types/models';

type CreateStarterPackCardsInput = {
  userId: string;
  favoriteClubId?: string;
  count?: number;
};

export type StarterPackAvailability = {
  opened: boolean;
  pending: boolean;
  unopenedPackCount: number;
  existingCards: UserCard[];
};

export class StarterPackPersistenceError extends Error {
  constructor(message: string, public readonly detail?: string) {
    super(message);
    this.name = 'StarterPackPersistenceError';
  }
}

export async function getExistingStarterPackCards(userId: string): Promise<UserCard[]> {
  return pb.collection('user_cards').getFullList<UserCard>({
    expand: 'template,player,player.club,match,match.homeClub,match.awayClub,match.stadium,match.stadium.club,stadium,stadium.club',
    filter: `user = "${userId}" && origin = "starter_pack"`,
    sort: '-acquiredAt',
  });
}

export async function getStarterPackAvailability(userId: string): Promise<StarterPackAvailability> {
  const existingCards = await getExistingStarterPackCards(userId);
  if (existingCards.length > 0) {
    return {
      opened: true,
      pending: false,
      unopenedPackCount: 0,
      existingCards,
    };
  }

  const userRecord = await getStarterPackUserState(userId);
  const opened = userRecord?.starterPackOpened === true;

  return {
    opened,
    pending: !opened,
    unopenedPackCount: opened ? 0 : 1,
    existingCards,
  };
}

export async function createStarterPackCards(input: CreateStarterPackCardsInput): Promise<UserCard[]> {
  const existingCards = await getExistingStarterPackCards(input.userId);
  if (existingCards.length > 0) {
    return existingCards;
  }

  const [players, matches, stadiums] = await Promise.all([getPlayers(), getMatches(), getStadiums()]);
  const selectedPayloads = selectStarterCardPayloads({
    userId: input.userId,
    favoriteClubId: input.favoriteClubId,
    players,
    matches,
    stadiums,
    count: input.count ?? 2,
  });

  if (selectedPayloads.length === 0) {
    return [];
  }

  const recheckedCards = await getExistingStarterPackCards(input.userId);
  if (recheckedCards.length > 0) {
    return recheckedCards;
  }

  let created: UserCard[];
  try {
    created = await Promise.all(
      selectedPayloads.map((payload) => pb.collection('user_cards').create<UserCard>(removeUndefined(payload))),
    );
  } catch (error) {
    throw new StarterPackPersistenceError('Starter Pack konnte nicht gespeichert werden.', getPocketBaseErrorDetail(error));
  }

  await Promise.all(created.map((card) => createStarterCardEvent(input.userId, card)));
  await markStarterPackOpened(input.userId);
  await checkAchievements(input.userId);

  return created;
}

function selectStarterCardPayloads(input: {
  userId: string;
  favoriteClubId?: string;
  players: Player[];
  matches: Match[];
  stadiums: Stadium[];
  count: number;
}): Omit<UserCard, 'id'>[] {
  const now = new Date().toISOString();
  const payloads: Omit<UserCard, 'id'>[] = [];
  const activePlayers = input.players.filter((player) => player.active);
  const favoriteClubPlayers = input.favoriteClubId ? activePlayers.filter((player) => player.club === input.favoriteClubId) : [];
  const selectedPlayers = [...favoriteClubPlayers, ...activePlayers].filter(uniqueById).slice(0, input.count);

  selectedPlayers.forEach((player, index) => {
    payloads.push(createStarterPlayerPayload(input.userId, player, now, index));
  });

  if (payloads.length < input.count) {
    const stadium = input.favoriteClubId
      ? input.stadiums.find((item) => item.club === input.favoriteClubId) ?? input.stadiums[0]
      : input.stadiums[0];

    if (stadium) {
      payloads.push(createStarterStadiumPayload(input.userId, stadium, now, payloads.length));
    }
  }

  if (payloads.length < input.count) {
    const match = input.favoriteClubId
      ? input.matches.find((item) => item.homeClub === input.favoriteClubId || item.awayClub === input.favoriteClubId) ?? input.matches[0]
      : input.matches[0];

    if (match) {
      payloads.push(createStarterMatchPayload(input.userId, match, now, payloads.length));
    }
  }

  return payloads.slice(0, input.count);
}

function createStarterPlayerPayload(userId: string, player: Player, acquiredAt: string, index: number): Omit<UserCard, 'id'> {
  return baseStarterPayload(userId, acquiredAt, index, {
    type: 'player',
    title: player.displayName,
    subtitle: player.club,
    player: player.id,
  });
}

function createStarterStadiumPayload(userId: string, stadium: Stadium, acquiredAt: string, index: number): Omit<UserCard, 'id'> {
  return baseStarterPayload(userId, acquiredAt, index, {
    type: 'stadium',
    title: stadium.name,
    subtitle: stadium.city,
    stadium: stadium.id,
    stadiumName: stadium.name,
    stadiumCity: stadium.city,
    stadiumCapacity: stadium.capacity,
    stadiumImage: stadium.image,
  });
}

function createStarterMatchPayload(userId: string, match: Match, acquiredAt: string, index: number): Omit<UserCard, 'id'> {
  const homeName = match.expand?.homeClub?.name || 'Home';
  const awayName = match.expand?.awayClub?.name || 'Away';
  return baseStarterPayload(userId, acquiredAt, index, {
    type: 'match',
    title: `${homeName} vs ${awayName}`,
    subtitle: `${match.competition} | ${new Date(match.kickoffAt).toLocaleDateString('de-DE')}`,
    match: match.id,
    stadium: match.stadium,
    stadiumName: match.stadiumName,
    stadiumCity: match.stadiumCity,
    stadiumCapacity: match.stadiumCapacity,
    stadiumImage: match.stadiumImage,
  });
}

function baseStarterPayload(
  userId: string,
  acquiredAt: string,
  index: number,
  partial: Partial<Omit<UserCard, 'id'>>,
): Omit<UserCard, 'id'> {
  return {
    user: userId,
    type: partial.type ?? 'player',
    title: partial.title ?? 'CURVAO Starter Card',
    subtitle: partial.subtitle ?? 'Starter Pack',
    rarity: 'standard',
    origin: 'starter_pack',
    editionNumber: 0,
    editionSize: 10000,
    match: partial.match,
    player: partial.player,
    stadium: partial.stadium,
    tradable: false,
    bound: true,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 1,
    acquiredAt,
    archived: false,
    favorite: false,
    stadiumName: partial.stadiumName,
    stadiumCity: partial.stadiumCity,
    stadiumCapacity: partial.stadiumCapacity,
    stadiumImage: partial.stadiumImage,
  };
}

function uniqueById<T extends { id: string }>(item: T, index: number, items: T[]) {
  return items.findIndex((candidate) => candidate.id === item.id) === index;
}

async function markStarterPackOpened(userId: string) {
  try {
    await pb.collection('users').update(userId, {
      starterPackOpened: true,
      starterPackOpenedAt: new Date().toISOString(),
    });
  } catch {
    // Optional user fields may not exist yet. Duplicate protection is based on user_cards origin.
  }
}

async function getStarterPackUserState(userId: string): Promise<{ starterPackOpened?: boolean } | null> {
  try {
    const record = await pb.collection('users').getOne(userId);
    return {
      starterPackOpened: record.starterPackOpened === true,
    };
  } catch {
    return null;
  }
}

async function createStarterCardEvent(userId: string, card: UserCard) {
  try {
    await pb.collection('card_events').create({
      user: userId,
      card: card.id,
      eventType: 'earned',
      title: 'Starter Pack Card',
      description: `${card.title} was added to the Collection from the Starter Pack.`,
      relatedMatch: card.match,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Card persistence is the source of truth. Missing event logging must not create duplicate cards.
  }
}

function removeUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

function getPocketBaseErrorDetail(error: unknown) {
  const candidate = error as {
    message?: string;
    status?: number;
    data?: {
      message?: string;
      data?: Record<string, { code?: string; message?: string }>;
    };
  };
  const fieldErrors = candidate.data?.data
    ? Object.entries(candidate.data.data).map(([field, fieldError]) => `${field}: ${fieldError.message ?? fieldError.code ?? 'invalid'}`)
    : [];

  return [
    candidate.status ? `Status ${candidate.status}` : undefined,
    candidate.message,
    candidate.data?.message,
    ...fieldErrors,
  ].filter(Boolean).join(' · ');
}
