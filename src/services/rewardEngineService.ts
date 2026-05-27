import { checkAchievements } from '@/src/services/achievementService';
import { getMatchById, getMatchPlayers } from '@/src/services/matchService';
import { pb } from '@/src/services/pocketbase';
import type { CardTemplate, Match, RewardEvent, UserCard } from '@/src/types/models';

export type RewardResult = {
  granted: boolean;
  alreadyGranted?: boolean;
  userCard?: UserCard | null;
  xpAmount?: number;
  bondXpAmount?: number;
  rewardEvent?: RewardEvent | null;
  message?: string;
};

const LIVE_WATCH_XP = 100;
const LIVE_WATCH_BOND_XP = 25;
let rewardEventsReadable: boolean | undefined;

export async function hasRewardEvent(input: {
  userId: string;
  actionType: 'live_watch' | 'stadium_checkin';
  sourceType: 'match';
  sourceId: string;
}): Promise<boolean> {
  if (!(await canReadRewardEvents())) {
    return false;
  }

  try {
    const events = await pb.collection('reward_events').getFullList<RewardEvent>({
      filter: [
        `user = "${input.userId}"`,
        `actionType = "${input.actionType}"`,
        `sourceType = "${input.sourceType}"`,
        `sourceId = "${input.sourceId}"`,
        'status = "granted"',
      ].join(' && '),
    });

    return events.length > 0;
  } catch {
    return false;
  }
}

export async function grantLiveWatchReward(input: {
  userId: string;
  matchId: string;
  sessionId: string;
  watchedSeconds: number;
  requiredSeconds: number;
}): Promise<RewardResult> {
  const alreadyRewarded = await hasRewardEvent({
    userId: input.userId,
    actionType: 'live_watch',
    sourceType: 'match',
    sourceId: input.matchId,
  });

  if (alreadyRewarded) {
    return {
      granted: false,
      alreadyGranted: true,
      xpAmount: LIVE_WATCH_XP,
      bondXpAmount: LIVE_WATCH_BOND_XP,
      message: 'Live Watch Reward wurde bereits vergeben.',
    };
  }

  const existingLiveCard = await getExistingLiveWatchCard(input.userId, input.matchId);
  if (existingLiveCard) {
    const rewardEvent = await createRewardEvent({
      userId: input.userId,
      matchId: input.matchId,
      sessionId: input.sessionId,
      rewardType: 'card',
      userCardId: existingLiveCard.id,
      watchedSeconds: input.watchedSeconds,
      requiredSeconds: input.requiredSeconds,
    });

    return {
      granted: false,
      alreadyGranted: true,
      userCard: existingLiveCard,
      xpAmount: LIVE_WATCH_XP,
      bondXpAmount: LIVE_WATCH_BOND_XP,
      rewardEvent,
      message: 'Live Watch Card war bereits vorhanden.',
    };
  }

  const template = await selectLiveWatchRewardCardTemplate({ matchId: input.matchId, userId: input.userId });
  const userCard = template
    ? await createRewardUserCardFromTemplate({
      userId: input.userId,
      matchId: input.matchId,
      template,
      bondXpAmount: LIVE_WATCH_BOND_XP,
    })
    : null;

  await incrementUserXp(input.userId, LIVE_WATCH_XP);

  const rewardEvent = await createRewardEvent({
    userId: input.userId,
    matchId: input.matchId,
    sessionId: input.sessionId,
    rewardType: userCard ? 'card' : 'xp',
    userCardId: userCard?.id,
    watchedSeconds: input.watchedSeconds,
    requiredSeconds: input.requiredSeconds,
  });

  await checkAchievements(input.userId);

  return {
    granted: true,
    userCard,
    xpAmount: LIVE_WATCH_XP,
    bondXpAmount: LIVE_WATCH_BOND_XP,
    rewardEvent,
    message: userCard ? 'Live Verified Card erhalten.' : 'Live Watch abgeschlossen. XP erhalten.',
  };
}

export async function selectLiveWatchRewardCardTemplate(input: {
  matchId: string;
  userId: string;
}): Promise<CardTemplate | null> {
  void input;
  let templates: CardTemplate[] = [];

  try {
    templates = await pb.collection('card_templates').getFullList<CardTemplate>({
      filter: 'active = true',
      sort: 'type,rarity',
    });
  } catch {
    templates = [];
  }

  return selectTestingPlayerTemplate(templates);
}

export async function selectStadiumCheckinRewardCardTemplate(): Promise<CardTemplate | null> {
  let templates: CardTemplate[] = [];

  try {
    templates = await pb.collection('card_templates').getFullList<CardTemplate>({
      filter: 'active = true',
      sort: 'type,rarity',
    });
  } catch {
    templates = [];
  }

  return selectTestingPlayerTemplate(templates);
}

export async function createRewardUserCardFromTemplate(input: {
  userId: string;
  matchId: string;
  template: CardTemplate;
  bondXpAmount: number;
  origin?: UserCard['origin'];
  eventTitle?: string;
  eventDescription?: string;
}): Promise<UserCard> {
  const match = await getMatchById(input.matchId);
  const now = new Date().toISOString();
  const payload = await getRewardCardPayload(
    input.userId,
    input.template,
    input.matchId,
    match,
    now,
    input.bondXpAmount,
    input.origin ?? 'live_verified',
  );
  
  const card = await pb.collection('user_cards').create<UserCard>(removeUndefined(payload));

  await pb.collection('card_events').create({
    user: input.userId,
    card: card.id,
    eventType: 'earned',
    title: input.eventTitle ?? 'Live Watch Reward',
    description: input.eventDescription ?? `${card.title} wurde über Live Watch verdient.`,
    relatedMatch: input.matchId,
    createdAt: now,
  });

  return card;
}

async function getExistingLiveWatchCard(userId: string, matchId: string) {
  try {
    const cards = await pb.collection('user_cards').getFullList<UserCard>({
      filter: `user = "${userId}" && match = "${matchId}" && origin = "live_verified"`,
      sort: '-acquiredAt',
    });
    return cards[0] ?? null;
  } catch {
    return null;
  }
}

async function getRewardCardPayload(
  userId: string,
  template: CardTemplate,
  matchId: string,
  match: Match | undefined,
  acquiredAt: string,
  bondXpAmount: number,
  origin: UserCard['origin'],
): Promise<Omit<UserCard, 'id'>> {
  if (template.type === 'player') {
    const matchPlayers = await getMatchPlayers(matchId);
    const matchPlayer = matchPlayers[0];
    const playerRecord = matchPlayer ? await pb.collection('players').getOne(matchPlayer.player).catch(() => null) : null;
    const homeName = match?.expand?.homeClub?.name || 'Home';

    return baseRewardPayload(userId, template, matchId, acquiredAt, bondXpAmount, origin, {
      type: 'player',
      title: playerRecord?.displayName ?? 'Live Verified Player',
      subtitle: `${homeName} | Live Watch`,
      player: matchPlayer?.player,
    });
  }

  if (template.type === 'stadium') {
    const stadium = match?.expand?.stadium;

    return baseRewardPayload(userId, template, matchId, acquiredAt, bondXpAmount, origin, {
      type: 'stadium',
      title: stadium?.name ?? match?.stadiumName ?? 'Live Verified Stadium',
      subtitle: stadium?.city ?? match?.stadiumCity ?? 'Live Watch',
      stadium: stadium?.id ?? match?.stadium,
      stadiumName: stadium?.name ?? match?.stadiumName,
      stadiumCity: stadium?.city ?? match?.stadiumCity,
      stadiumCapacity: stadium?.capacity ?? match?.stadiumCapacity,
      stadiumImage: stadium?.image ?? match?.stadiumImage,
    });
  }

  const homeName = match?.expand?.homeClub?.name || 'Home';
  const awayName = match?.expand?.awayClub?.name || 'Away';

  return baseRewardPayload(userId, template, matchId, acquiredAt, bondXpAmount, origin, {
    type: 'match',
    title: match ? `${homeName} vs ${awayName}` : 'Live Verified Match',
    subtitle: match ? `${match.competition} | ${new Date(match.kickoffAt).toLocaleDateString('de-DE')}` : 'Live Watch',
    stadium: match?.stadium,
    stadiumName: match?.stadiumName,
    stadiumCity: match?.stadiumCity,
    stadiumCapacity: match?.stadiumCapacity,
    stadiumImage: match?.stadiumImage,
  });
}

function baseRewardPayload(
  userId: string,
  template: CardTemplate,
  matchId: string,
  acquiredAt: string,
  bondXpAmount: number,
  origin: UserCard['origin'],
  partial: Partial<Omit<UserCard, 'id'>>,
): Omit<UserCard, 'id'> {
  return {
    user: userId,
    template: template.id,
    type: partial.type ?? template.type,
    title: partial.title ?? template.name,
    subtitle: partial.subtitle ?? 'Live Verified',
    rarity: template.rarity ?? 'standard',
    origin,
    editionNumber: 0,
    editionSize: 10000,
    match: matchId,
    player: partial.player,
    stadium: partial.stadium,
    tradable: false,
    bound: true,
    isMainCard: false,
    bondXp: bondXpAmount,
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

function selectTestingPlayerTemplate(templates: CardTemplate[]): CardTemplate | null {
  return (
    templates.find((template) => template.type === 'player' && template.rarity === 'standard') ??
    templates.find((template) => template.type === 'player') ??
    null
  );
}

async function createRewardEvent(input: {
  userId: string;
  matchId: string;
  sessionId: string;
  rewardType: 'card' | 'xp';
  userCardId?: string;
  watchedSeconds: number;
  requiredSeconds: number;
}) {
  const payload: Omit<RewardEvent, 'id'> = {
    user: input.userId,
    actionType: 'live_watch',
    sourceType: 'match',
    sourceId: input.matchId,
    match: input.matchId,
    rewardType: input.rewardType,
    card: input.userCardId,
    xpAmount: LIVE_WATCH_XP,
    bondXpAmount: LIVE_WATCH_BOND_XP,
    status: 'granted',
    createdAt: new Date().toISOString(),
    metadata: JSON.stringify({
      sessionId: input.sessionId,
      requiredSeconds: input.requiredSeconds,
      watchedSeconds: input.watchedSeconds,
    }),
  };

  return await pb.collection('reward_events').create<RewardEvent>(payload);
}

async function incrementUserXp(userId: string, xpAmount: number) {
  try {
    const user = await pb.collection('users').getOne(userId);
    const currentFanXp = typeof user.fanXp === 'number' ? user.fanXp : 0;
    await pb.collection('users').update(userId, { fanXp: currentFanXp + xpAmount });
  } catch (error) {
    console.error('Failed to increment user XP', error);
  }
}

function removeUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

async function canReadRewardEvents() {
  if (rewardEventsReadable !== undefined) {
    return rewardEventsReadable;
  }

  try {
    await pb.collection('reward_events').getList(1, 1, { skipTotal: true });
    rewardEventsReadable = true;
  } catch (error) {
    rewardEventsReadable = !isCollectionMissingError(error);
  }

  return rewardEventsReadable;
}

function isCollectionMissingError(error: unknown) {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number((error as { status?: number }).status) === 404,
  );
}
