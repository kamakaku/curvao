import { checkAchievements } from '@/src/services/achievementService';
import { createId, mockStore } from '@/src/services/mockStore';
import { getClubName, getMatchById, getMatchPlayers } from '@/src/services/matchService';
import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { CardEvent, CheckinType, Match, Rarity, UserCard } from '@/src/types/models';

function matchTitle(match?: Match) {
  if (!match) {
    return 'Verified Match';
  }

  return `${getClubName(match.homeClub)} vs ${getClubName(match.awayClub)}`;
}

function matchSubtitle(match?: Match) {
  if (!match) {
    return 'Curvao Archive';
  }

  return `${match.competition} | ${new Date(match.kickoffAt).toLocaleDateString()}`;
}

function playerCardRarity(seed: number): Rarity {
  if (seed % 19 === 0) return 'legendary';
  if (seed % 11 === 0) return 'epic';
  if (seed % 5 === 0) return 'rare';
  return 'standard';
}

function createMockEvent(userId: string, card: UserCard, eventType: CardEvent['eventType'], relatedCard?: string) {
  const event: CardEvent = {
    id: createId('event'),
    user: userId,
    card: card.id,
    eventType,
    title: eventType === 'bound' ? 'Duplicate bound' : 'Card archived',
    description: eventType === 'bound' ? `${card.title} was bound into a Main Card.` : `${card.title} entered the Archive.`,
    relatedCard,
    relatedMatch: card.match,
    createdAt: new Date().toISOString(),
  };
  mockStore.cardEvents.push(event);
  return event;
}

export async function getUserCards(userId: string): Promise<UserCard[]> {
  return tryPocketBase(
    async () =>
      pb.collection('user_cards').getFullList<UserCard>({
        expand: 'template,player,player.club,match,match.homeClub,match.awayClub,match.stadium,match.stadium.club,stadium,stadium.club',
        filter: `user = "${userId}"`,
        sort: '-acquiredAt',
      }),
    () => mockStore.userCards.filter((card) => card.user === userId).sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt)),
  );
}

export async function getLatestCards(userId: string, count = 4): Promise<UserCard[]> {
  const cards = await getUserCards(userId);
  return cards.slice(0, count);
}

export async function generateCardsForCheckin(userId: string, matchId: string, checkinType: CheckinType, sourceCheckin?: string): Promise<UserCard[]> {
  const match = await getMatchById(matchId);
  const matchPlayers = await getMatchPlayers(matchId);
  const playerCount = 3 + (matchId.length % 3);
  const selectedPlayers = matchPlayers.slice(0, playerCount);
  const now = new Date().toISOString();

  const matchCardPayload: Omit<UserCard, 'id'> = {
    user: userId,
    type: 'match',
    title: matchTitle(match),
    subtitle: matchSubtitle(match),
    rarity: match?.importance ?? 'standard',
    origin: checkinType === 'stadium' ? 'stadium_verified' : 'logged_viewing',
    editionNumber: mockStore.userCards.length + 1,
    editionSize: 1200,
    match: matchId,
    sourceCheckin,
    tradable: false,
    bound: false,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 1,
    acquiredAt: now,
    archived: true,
    favorite: false,
  };

  const playerPayloads: Omit<UserCard, 'id'>[] = selectedPlayers.map((matchPlayer, index) => {
    const player = mockStore.players.find((item) => item.id === matchPlayer.player);

    return {
      user: userId,
      type: 'player',
      title: player?.displayName ?? 'Verified Player',
      subtitle: `${getClubName(matchPlayer.club)}${player?.shirtNumber ? ` | #${player.shirtNumber}` : ''}`,
      rarity: playerCardRarity(index + mockStore.userCards.length),
      origin: 'self_earned',
      editionNumber: mockStore.userCards.length + index + 2,
      editionSize: 500,
      match: matchId,
      player: matchPlayer.player,
      sourceCheckin,
      tradable: true,
      bound: false,
      isMainCard: false,
      bondXp: 0,
      bondLevel: 1,
      acquiredAt: now,
      archived: true,
      favorite: false,
    };
  });

  return tryPocketBase(
    async () => {
      const created = await Promise.all(
        [matchCardPayload, ...playerPayloads].map((card) => pb.collection('user_cards').create<UserCard>(card)),
      );

      await Promise.all(
        created.map((card) =>
          pb.collection('card_events').create({
            user: userId,
            card: card.id,
            eventType: 'earned',
            title: 'Card archived',
            description: `${card.title} entered the Archive.`,
            relatedMatch: matchId,
            createdAt: new Date().toISOString(),
          }),
        ),
      );

      await checkAchievements(userId);
      return created;
    },
    async () => {
      const created = [matchCardPayload, ...playerPayloads].map((card) => ({ ...card, id: createId('card') }));
      mockStore.userCards.unshift(...created);
      created.forEach((card) => createMockEvent(userId, card, 'earned'));
      await checkAchievements(userId);
      return created;
    },
  );
}

export async function getDuplicatePlayerCards(userId: string): Promise<Record<string, UserCard[]>> {
  const playerCards = (await getUserCards(userId)).filter((card) => card.type === 'player' && card.player);
  return playerCards.reduce<Record<string, UserCard[]>>((groups, card) => {
    const key = card.player ?? card.title;
    groups[key] = [...(groups[key] ?? []), card];
    return groups;
  }, {});
}

export async function setMainCard(userCardId: string): Promise<UserCard> {
  const card = await tryPocketBase(
    async () => pb.collection('user_cards').getOne<UserCard>(userCardId),
    () => mockStore.userCards.find((item) => item.id === userCardId),
  );

  if (!card || card.type !== 'player' || card.bound) {
    throw new Error('Only unbound Player Cards can be selected as Main Cards.');
  }

  return tryPocketBase(
    async () => pb.collection('user_cards').update<UserCard>(userCardId, { isMainCard: true }),
    () => {
      mockStore.userCards.forEach((item) => {
        if (item.user === card.user && item.player === card.player) {
          item.isMainCard = item.id === userCardId;
        }
      });
      createMockEvent(card.user, card, 'main_selected');
      return card;
    },
  );
}

export async function bindDuplicateToMain(duplicateCardId: string, mainCardId: string): Promise<{ duplicate: UserCard; main: UserCard }> {
  const [duplicate, main] = await tryPocketBase(
    async () =>
      Promise.all([
        pb.collection('user_cards').getOne<UserCard>(duplicateCardId),
        pb.collection('user_cards').getOne<UserCard>(mainCardId),
      ]),
    () => [
      mockStore.userCards.find((card) => card.id === duplicateCardId),
      mockStore.userCards.find((card) => card.id === mainCardId),
    ],
  );

  if (!duplicate || !main) {
    throw new Error('Both cards must exist before binding.');
  }
  if (duplicate.type !== 'player' || main.type !== 'player') {
    throw new Error('Only Player Cards can be bound.');
  }
  if (duplicate.bound) {
    throw new Error('This duplicate is already bound.');
  }
  if (duplicate.isMainCard) {
    throw new Error('A Main Card cannot be bound into another card.');
  }
  if (duplicate.player !== main.player) {
    throw new Error('Only duplicate Player Cards for the same player can be bound.');
  }

  const nextBondXp = main.bondXp + 100;
  const nextBondLevel = Math.min(5, Math.floor(nextBondXp / 300) + 1);

  return tryPocketBase(
    async () => {
      const updatedDuplicate = await pb.collection('user_cards').update<UserCard>(duplicateCardId, {
        bound: true,
        boundTo: mainCardId,
        tradable: false,
      });
      const updatedMain = await pb.collection('user_cards').update<UserCard>(mainCardId, {
        bondXp: nextBondXp,
        bondLevel: nextBondLevel,
      });
      await pb.collection('card_events').create({
        user: main.user,
        card: duplicateCardId,
        eventType: 'bound',
        title: 'Duplicate bound',
        relatedCard: mainCardId,
        createdAt: new Date().toISOString(),
      });
      await checkAchievements(main.user);
      return { duplicate: updatedDuplicate, main: updatedMain };
    },
    async () => {
      duplicate.bound = true;
      duplicate.boundTo = mainCardId;
      duplicate.tradable = false;
      main.bondXp = nextBondXp;
      main.bondLevel = nextBondLevel;
      createMockEvent(main.user, duplicate, 'bound', mainCardId);
      await checkAchievements(main.user);
      return { duplicate, main };
    },
  );
}
