import type { CardSet, CardSetSlot, UserCard } from '@/src/types/models';
import type { RewardPackage } from '@/src/services/rewardPackageService';
import type { WantedCard } from '@/src/services/wantedCardService';

export type ResolvedSetSlot = {
  slot: CardSetSlot;
  status: 'owned' | 'missing' | 'wanted' | 'locked' | 'reward_pending';
  userCard?: UserCard;
  wanted?: boolean;
  title: string;
  subtitle?: string;
  hint?: string;
};

export type SetProgress = {
  totalSlots: number;
  ownedSlots: number;
  requiredSlots: number;
  ownedRequiredSlots: number;
  percent: number;
  completed: boolean;
  slots: ResolvedSetSlot[];
};

export function resolveSetProgress(input: {
  set: CardSet;
  slots: CardSetSlot[];
  userCards: UserCard[];
  wantedCards?: WantedCard[];
  rewardPackages?: RewardPackage[];
}): SetProgress {
  const wantedCards = input.wantedCards ?? [];
  const rewardPackages = input.rewardPackages ?? [];

  const resolvedSlots = input.slots
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((slot) => {
      const wanted = isSlotWanted(slot, wantedCards);
      const userCard = findMatchingUserCard(slot, input.userCards);
      const locked = isSlotLocked(slot, input.set.status);
      const rewardPending = !userCard && !locked && isSlotRewardPending(slot, rewardPackages, input.set.matchId);

      const status: ResolvedSetSlot['status'] = userCard
        ? 'owned'
        : locked
          ? 'locked'
          : rewardPending
            ? 'reward_pending'
            : wanted
              ? 'wanted'
              : 'missing';

      return {
        slot,
        status,
        userCard,
        wanted,
        title: resolveSlotTitle(slot),
        subtitle: resolveSlotSubtitle(slot),
        hint: resolveSlotHint(slot, status),
      };
    });

  const totalSlots = resolvedSlots.length;
  const ownedSlots = resolvedSlots.filter((slot) => slot.status === 'owned').length;
  const requiredSlots = resolvedSlots.filter((slot) => slot.slot.required).length;
  const ownedRequiredSlots = resolvedSlots.filter((slot) => slot.slot.required && slot.status === 'owned').length;
  const percent = totalSlots > 0 ? ownedSlots / totalSlots : 0;

  return {
    totalSlots,
    ownedSlots,
    requiredSlots,
    ownedRequiredSlots,
    percent,
    completed: requiredSlots > 0 && ownedRequiredSlots === requiredSlots,
    slots: resolvedSlots,
  };
}

export function findMatchingUserCard(slot: CardSetSlot, userCards: UserCard[]) {
  return userCards.find((card) => matchUserCardToSlot(card, slot));
}

export function matchUserCardToSlot(card: UserCard, slot: CardSetSlot) {
  const sourceMatch = getStringField(card, 'sourceMatch');
  const clubId = getStringField(card, 'clubId') || card.expand?.player?.club || card.expand?.stadium?.club || card.expand?.match?.homeClub || card.expand?.match?.awayClub;

  if (slot.cardTemplateId && (card.template === slot.cardTemplateId || getStringField(card, 'cardTemplateId') === slot.cardTemplateId)) return true;
  if (slot.playerId && (card.player === slot.playerId || getStringField(card, 'playerId') === slot.playerId)) return true;
  if (slot.matchId && (card.match === slot.matchId || sourceMatch === slot.matchId || getStringField(card, 'matchId') === slot.matchId)) {
    if (matchesCardTypeForSlot(card, slot.slotType)) return true;
  }
  if (slot.stadiumId && (card.stadium === slot.stadiumId || getStringField(card, 'stadiumId') === slot.stadiumId)) return true;
  if (slot.clubId && clubId === slot.clubId && matchesCardTypeForSlot(card, slot.slotType)) return true;

  if (slot.matchId) {
    if (slot.slotType === 'match_card' && card.type === 'match' && card.match === slot.matchId) return true;
    if (slot.slotType === 'moment_card' && card.type === 'moment' && card.match === slot.matchId) return true;
    if (slot.slotType === 'mvp_card' && card.match === slot.matchId && (card.type === 'player' || card.type === 'moment')) return true;
    if (slot.slotType === 'attendance_card' && card.match === slot.matchId && (card.type === 'match' || card.type === 'stadium')) return true;
    if (slot.slotType === 'live_watch_reward' && card.match === slot.matchId && card.origin === 'live_verified') return true;
    if (slot.slotType === 'stadium_checkin_reward' && card.match === slot.matchId && card.origin === 'stadium_verified') return true;
    if (!slot.playerId && !slot.stadiumId && card.match === slot.matchId && matchesCardTypeForSlot(card, slot.slotType)) return true;
  }

  return false;
}

export const matchesSlot = matchUserCardToSlot;

function matchesCardTypeForSlot(card: UserCard, slotType: CardSetSlot['slotType']) {
  switch (slotType) {
    case 'match_card':
      return card.type === 'match';
    case 'stadium_card':
      return card.type === 'stadium';
    case 'player_card':
      return card.type === 'player';
    case 'moment_card':
      return card.type === 'moment';
    case 'mvp_card':
      return card.type === 'player' || card.type === 'moment';
    case 'attendance_card':
      return card.type === 'stadium' || card.type === 'match';
    case 'live_watch_reward':
      return card.origin === 'live_verified';
    case 'stadium_checkin_reward':
      return card.origin === 'stadium_verified';
    case 'completion_reward':
      return false;
  }
}

export function isSlotWanted(slot: CardSetSlot, wantedCards: WantedCard[]) {
  return wantedCards.some((wantedCard) => {
    if (slot.cardTemplateId && wantedCard.cardTemplateId === slot.cardTemplateId) return true;
    if (slot.playerId && wantedCard.playerId === slot.playerId) return true;
    if (slot.matchId && wantedCard.matchId === slot.matchId && (wantedCard.targetType === 'match' || wantedCard.targetType === 'set')) return true;
    if (slot.stadiumId && wantedCard.stadiumId === slot.stadiumId) return true;
    if (slot.clubId && wantedCard.clubId === slot.clubId && wantedCard.setId === slot.setId) return true;
    return false;
  });
}

function isSlotLocked(slot: CardSetSlot, setStatus: CardSet['status']) {
  if (slot.unlockState === 'reward_only') return false;
  if (slot.unlockState === 'locked_until_match') {
    return setStatus === 'draft' || setStatus === 'upcoming';
  }
  if (slot.unlockState === 'locked_until_final') {
    return setStatus !== 'final' && setStatus !== 'archived';
  }
  return false;
}

function isSlotRewardPending(slot: CardSetSlot, rewardPackages: RewardPackage[], matchId?: string) {
  if (slot.slotType === 'live_watch_reward') {
    return rewardPackages.some((rewardPackage) => rewardPackage.sourceType === 'live_watch' && rewardPackage.matchId === matchId);
  }

  if (slot.slotType === 'stadium_checkin_reward' || slot.slotType === 'attendance_card') {
    return rewardPackages.some((rewardPackage) => rewardPackage.sourceType === 'stadium_checkin' && rewardPackage.matchId === matchId);
  }

  if (slot.slotType === 'match_card' || slot.slotType === 'player_card' || slot.slotType === 'moment_card' || slot.slotType === 'mvp_card') {
    return rewardPackages.some((rewardPackage) => rewardPackage.sourceType === 'live_watch' && rewardPackage.matchId === matchId);
  }

  if (slot.slotType === 'stadium_card') {
    return rewardPackages.some((rewardPackage) => rewardPackage.sourceType === 'stadium_checkin' && rewardPackage.matchId === matchId);
  }

  return false;
}

function resolveSlotTitle(slot: CardSetSlot) {
  return slot.title ?? defaultSlotTitle(slot.slotType);
}

function resolveSlotSubtitle(slot: CardSetSlot) {
  if (slot.playerId) return 'Player Card';
  if (slot.matchId && slot.slotType === 'match_card') return 'Match Card';
  if (slot.stadiumId) return 'Stadium Card';
  return undefined;
}

function resolveSlotHint(slot: CardSetSlot, status: ResolvedSetSlot['status']) {
  if (status === 'owned') return 'Besitzt';
  if (status === 'wanted') return 'Gesucht';
  if (status === 'reward_pending') return 'Ein Reward Package wartet auf dich.';
  if (status === 'locked') {
    if (slot.unlockState === 'locked_until_final') return 'Nach Spielende verfügbar';
    if (slot.unlockState === 'locked_until_match') return 'Wird am Matchday freigeschaltet';
  }
  return slot.hint;
}

function defaultSlotTitle(slotType: CardSetSlot['slotType']) {
  switch (slotType) {
    case 'match_card':
      return 'Match';
    case 'stadium_card':
      return 'Stadium';
    case 'player_card':
      return 'Player';
    case 'moment_card':
      return 'Moment';
    case 'mvp_card':
      return 'MVP';
    case 'attendance_card':
      return 'Attendance';
    case 'live_watch_reward':
      return 'Live Watch';
    case 'stadium_checkin_reward':
      return 'Stadium Check-in';
    case 'completion_reward':
      return 'Completion Bonus';
  }
}

function getStringField(card: UserCard, key: string) {
  const value = (card as unknown as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}
