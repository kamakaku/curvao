import { getUserCards, isCardInActiveCollection } from '@/src/services/cardService';
import { pb } from '@/src/services/pocketbase';
import { getUnopenedRewardPackages, type RewardPackage } from '@/src/services/rewardPackageService';
import { getWantedCards, type WantedCard } from '@/src/services/wantedCardService';
import type {
  CardSet,
  CardSetSlot,
  Club,
  Match,
  SetCompletionReward,
  Stadium,
} from '@/src/types/models';
import { getMatchViewState } from '@/src/utils/matchUtils';
import { resolveSetProgress, type ResolvedSetSlot, type SetProgress } from '@/src/utils/setProgressUtils';

export type ResolvedCardSetSlot = ResolvedSetSlot;

export type CardSetProgress = SetProgress & {
  set: CardSet;
  wantedCards?: WantedCard[];
  unopenedRewardPackages?: RewardPackage[];
};

export type MatchdaySetPreview = {
  set: CardSet;
  progress: CardSetProgress;
  featuredSlots: ResolvedSetSlot[];
  completionReward?: SetCompletionReward;
};

type PocketBaseCardSet = {
  id: string;
  key?: string;
  type?: string;
  title?: string;
  subtitle?: string;
  name?: string;
  matchId?: string;
  match?: string;
  clubId?: string;
  club?: string;
  stadiumId?: string;
  stadium?: string;
  season?: string;
  description?: string;
  status?: string;
  featured?: boolean;
  active?: boolean;
  totalSlots?: number;
  completionReward?: unknown;
  created?: string;
  updated?: string;
  expand?: {
    match?: Match;
    club?: Club;
    stadium?: Stadium;
  };
};

type PocketBaseCardSetSlot = {
  id: string;
  setId?: string;
  set?: string;
  slotType?: string;
  cardTemplateId?: string;
  cardTemplate?: string;
  playerId?: string;
  player?: string;
  matchId?: string;
  match?: string;
  stadiumId?: string;
  stadium?: string;
  clubId?: string;
  club?: string;
  rarity?: string;
  required?: boolean;
  sortOrder?: number;
  title?: string;
  hint?: string;
  unlockState?: 'available' | 'locked_until_match' | 'locked_until_final' | 'reward_only';
};

let cardSetsReadable: boolean | undefined;
let cardSetSlotsReadable: boolean | undefined;

export async function getCardSets(options?: {
  type?: string;
  active?: boolean;
  featured?: boolean;
}): Promise<CardSet[]> {
  if (!(await canReadCardSets())) {
    return [];
  }

  const expand = 'match,club,stadium';
  const filterVariants = buildCardSetFilterVariants(options);

  for (const filter of filterVariants) {
    try {
      const records = await pb.collection('card_sets').getFullList<PocketBaseCardSet>({
        ...(filter ? { filter } : {}),
        expand,
      });
      return records.map(fromPocketBaseCardSet).sort(compareCardSets);
    } catch (error) {
      if (!isQueryFieldError(error)) {
        break;
      }
    }
  }

  return [];
}

export async function getCardSetById(setId: string): Promise<CardSet | null> {
  if (!(await canReadCardSets())) {
    return null;
  }

  try {
    const record = await pb.collection('card_sets').getOne<PocketBaseCardSet>(setId, {
      expand: 'match,club,stadium',
    });
    return fromPocketBaseCardSet(record);
  } catch {
    return null;
  }
}

export async function getCardSetSlots(setId: string): Promise<CardSetSlot[]> {
  if (!(await canReadCardSetSlots())) {
    return [];
  }

  for (const filter of [`set = "${setId}"`, `setId = "${setId}"`]) {
    try {
      const records = await pb.collection('card_set_slots').getFullList<PocketBaseCardSetSlot>({
        filter,
      });
      return records.map(fromPocketBaseCardSetSlot).sort(compareCardSetSlots);
    } catch (error) {
      if (!isQueryFieldError(error)) {
        break;
      }
    }
  }

  return [];
}

export async function getMatchdaySetForMatch(matchId: string): Promise<CardSet | null> {
  if (!(await canReadCardSets())) {
    return null;
  }

  for (const filter of [
    [`type = "matchday"`, `match = "${matchId}"`].join(' && '),
    [`type = "matchday"`, `matchId = "${matchId}"`].join(' && '),
  ]) {
    try {
      const records = await pb.collection('card_sets').getFullList<PocketBaseCardSet>({
        filter,
        expand: 'match,club,stadium',
      });
      return records[0] ? records.map(fromPocketBaseCardSet).sort(compareCardSets)[0] : null;
    } catch (error) {
      if (!isQueryFieldError(error)) {
        break;
      }
    }
  }

  return null;
}

export async function getUserSetProgress(input: {
  userId: string;
  setId: string;
}): Promise<CardSetProgress | null> {
  const [set, userCards, wantedCards, rewardPackages] = await Promise.all([
    getCardSetById(input.setId),
    getUserCards(input.userId),
    getWantedCards(input.userId).catch(() => []),
    getUnopenedRewardPackages(input.userId).catch(() => []),
  ]);

  if (!set) return null;

  const slots = await getCardSetSlots(set.id);
  if (slots.length === 0) return null;

  const activeUserCards = userCards.filter(isCardInActiveCollection);
  const setRewardPackages = rewardPackages.filter((rewardPackage) => {
    if (set.matchId && rewardPackage.matchId === set.matchId) return true;
    if (rewardPackage.sourceType === 'set_completion' && rewardPackage.sourceId === set.id) return true;
    return false;
  });

  const progress = resolveSetProgress({
    set,
    slots,
    userCards: activeUserCards,
    wantedCards,
    rewardPackages: setRewardPackages,
  });

  return {
    set,
    wantedCards,
    unopenedRewardPackages: setRewardPackages,
    ...progress,
  };
}

export async function getMatchdaySetPreview(input: {
  userId: string;
  matchId: string;
}): Promise<MatchdaySetPreview | null> {
  const set = await getMatchdaySetForMatch(input.matchId);
  if (!set) return null;

  const progress = await getUserSetProgress({ userId: input.userId, setId: set.id });
  if (!progress) return null;

  return {
    set,
    progress,
    featuredSlots: progress.slots,
    completionReward: set.completionReward,
  };
}

export async function getVisibleCardSetsForUser(input: {
  userId: string;
  wantedCards?: WantedCard[];
}): Promise<CardSetProgress[]> {
  const [sets, userCards, wantedCards, rewardPackages] = await Promise.all([
    getCardSets({ active: true }),
    getUserCards(input.userId),
    input.wantedCards ? Promise.resolve(input.wantedCards) : getWantedCards(input.userId).catch(() => []),
    getUnopenedRewardPackages(input.userId).catch(() => []),
  ]);

  const activeUserCards = userCards.filter(isCardInActiveCollection);

  const progressItems = await Promise.all(
    sets.map(async (set) => {
      const slots = await getCardSetSlots(set.id);
      if (slots.length === 0) return null;

      const setRewardPackages = rewardPackages.filter((rewardPackage) => {
        if (set.matchId && rewardPackage.matchId === set.matchId) return true;
        if (rewardPackage.sourceType === 'set_completion' && rewardPackage.sourceId === set.id) return true;
        return false;
      });

      const progress = resolveSetProgress({
        set,
        slots,
        userCards: activeUserCards,
        wantedCards,
        rewardPackages: setRewardPackages,
      });

      const progressItem: CardSetProgress = {
        set,
        wantedCards,
        unopenedRewardPackages: setRewardPackages,
        ...progress,
      };
      return progressItem;
    }),
  );

  return progressItems.filter((item): item is CardSetProgress => item !== null);
}

function fromPocketBaseCardSet(record: PocketBaseCardSet): CardSet {
  const title = record.title || record.name || 'Set';
  return {
    id: record.id,
    key: record.key || record.id,
    type: normalizeSetType(record.type),
    title,
    subtitle: record.subtitle,
    name: title,
    clubId: record.clubId || record.club,
    clubName: record.expand?.club?.name,
    matchId: record.matchId || record.match,
    stadiumId: record.stadiumId || record.stadium,
    season: record.season,
    description: record.description,
    status: normalizeSetStatus(record.status, record.expand?.match),
    featured: record.featured,
    active: record.active ?? true,
    totalSlots: record.totalSlots,
    completionReward: parseCompletionReward(record.completionReward),
    createdAt: record.created,
    updatedAt: record.updated,
    expand: record.expand,
  };
}

function fromPocketBaseCardSetSlot(record: PocketBaseCardSetSlot): CardSetSlot {
  return {
    id: record.id,
    setId: record.setId || record.set || '',
    slotType: normalizeSlotType(record.slotType),
    cardTemplateId: record.cardTemplateId || record.cardTemplate,
    playerId: record.playerId || record.player,
    matchId: record.matchId || record.match,
    stadiumId: record.stadiumId || record.stadium,
    clubId: record.clubId || record.club,
    rarity: normalizeRarity(record.rarity),
    required: record.required ?? true,
    sortOrder: record.sortOrder ?? 0,
    title: record.title,
    hint: record.hint,
    unlockState: record.unlockState ?? 'available',
  };
}

function buildCardSetFilterVariants(options?: {
  type?: string;
  active?: boolean;
  featured?: boolean;
}) {
  const clauses: string[] = [];

  if (options?.type) {
    clauses.push(`type = "${options.type}"`);
  }
  if (typeof options?.active === 'boolean') {
    clauses.push(`active = ${options.active ? 'true' : 'false'}`);
  }
  if (typeof options?.featured === 'boolean') {
    clauses.push(`featured = ${options.featured ? 'true' : 'false'}`);
  }

  if (clauses.length === 0) {
    return [undefined];
  }

  return [clauses.join(' && ')];
}

function normalizeSetType(type?: string): CardSet['type'] {
  if (type === 'matchday' || type === 'stadium' || type === 'moment' || type === 'origin' || type === 'special' || type === 'club_season') {
    return type;
  }
  return 'special';
}

function normalizeSetStatus(status?: string, match?: Match): CardSet['status'] {
  if (status === 'draft' || status === 'upcoming' || status === 'active' || status === 'final' || status === 'archived') {
    return status;
  }
  if (match) {
    return deriveSetStatus(match);
  }
  return 'active';
}

function deriveSetStatus(match: Match): CardSet['status'] {
  const viewState = getMatchViewState(match);
  if (viewState.status === 'final') return 'final';
  if (viewState.status === 'live') return 'active';
  if (viewState.status === 'upcoming') return 'upcoming';
  return 'archived';
}

function normalizeSlotType(slotType?: string): CardSetSlot['slotType'] {
  switch (slotType) {
    case 'match_card':
    case 'stadium_card':
    case 'player_card':
    case 'moment_card':
    case 'mvp_card':
    case 'attendance_card':
    case 'live_watch_reward':
    case 'stadium_checkin_reward':
    case 'completion_reward':
      return slotType;
    case 'match':
      return 'match_card';
    case 'stadium':
      return 'stadium_card';
    case 'player':
      return 'player_card';
    default:
      return 'moment_card';
  }
}

function normalizeRarity(rarity?: string): CardSetSlot['rarity'] {
  if (rarity === 'standard' || rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' || rarity === 'oneoff') {
    return rarity;
  }
  return undefined;
}

function parseCompletionReward(input: unknown): SetCompletionReward | undefined {
  if (!input) return undefined;
  if (typeof input === 'object') return input as SetCompletionReward;
  try {
    return JSON.parse(String(input)) as SetCompletionReward;
  } catch {
    return undefined;
  }
}

function compareCardSets(left: CardSet, right: CardSet) {
  const featuredDelta = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
  if (featuredDelta !== 0) return featuredDelta;

  const leftCreated = left.createdAt ? new Date(left.createdAt).getTime() : 0;
  const rightCreated = right.createdAt ? new Date(right.createdAt).getTime() : 0;
  if (rightCreated !== leftCreated) return rightCreated - leftCreated;

  return left.title.localeCompare(right.title);
}

function compareCardSetSlots(left: CardSetSlot, right: CardSetSlot) {
  return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
}

async function canReadCardSets() {
  if (cardSetsReadable !== undefined) return cardSetsReadable;

  try {
    await pb.collection('card_sets').getList(1, 1, { skipTotal: true });
    cardSetsReadable = true;
  } catch (error) {
    cardSetsReadable = !isCollectionMissingError(error);
  }

  return cardSetsReadable;
}

async function canReadCardSetSlots() {
  if (cardSetSlotsReadable !== undefined) return cardSetSlotsReadable;

  try {
    await pb.collection('card_set_slots').getList(1, 1, { skipTotal: true });
    cardSetSlotsReadable = true;
  } catch (error) {
    cardSetSlotsReadable = !isCollectionMissingError(error);
  }

  return cardSetSlotsReadable;
}

function isCollectionMissingError(error: unknown) {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number((error as { status?: number }).status) === 404,
  );
}

function isQueryFieldError(error: unknown) {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number((error as { status?: number }).status) === 400,
  );
}
