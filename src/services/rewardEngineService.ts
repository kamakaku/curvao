import { checkAchievements } from '@/src/services/achievementService';
import { getMatchById, getMatchPlayers } from '@/src/services/matchService';
import { pb, tryPocketBase } from '@/src/services/pocketbase';
import { REWARD_ECONOMY_CONFIG } from '@/src/config/rewardEconomy';
import type { CardTemplate, Match, RewardEvent, UserCard } from '@/src/types/models';
import type { RewardSource, RewardType, RewardResult, VerificationType, RewardRarity, PackageReward, RewardDefinition } from '@/src/types/rewards';

import { selectPersonalizedRewardCards } from './matchPlayerRewardService';

export * from '@/src/types/rewards';

let rewardEventsReadable: boolean | undefined;

function parseTemplateVisualConfig(template: CardTemplate) {
  if (!template.visualConfig) return null;
  try {
    return JSON.parse(template.visualConfig) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getClubTemplate(allTemplates: CardTemplate[], clubId?: string | null) {
  if (!clubId) return null;
  return allTemplates.find((template) => template.type === 'club' && template.key === `club_${clubId}`) ?? null;
}

function getPlayerTemplatesForClub(allTemplates: CardTemplate[], clubId?: string | null) {
  if (!clubId) return [];
  return allTemplates.filter((template) => {
    if (template.type !== 'player') return false;
    const visualConfig = parseTemplateVisualConfig(template);
    return visualConfig?.clubId === clubId;
  });
}

async function getFavoriteClubId(userId: string) {
  try {
    const user = await pb.collection('users').getOne(userId, { requestKey: null });
    return (user.favoriteClubId || user.favoriteClub || null) as string | null;
  } catch {
    return null;
  }
}

async function getExistingUserCards(userId: string) {
  try {
    return await pb.collection('user_cards').getFullList<UserCard>({
      filter: `user = "${userId}"`,
      fields: 'id,template,type,club,player',
      requestKey: null,
    });
  } catch {
    return [];
  }
}

/**
 * Main function to select a card template based on reward source and context.
 */
export async function selectRewardCardTemplate(input: {
  source: RewardSource;
  userId: string;
  matchId?: string;
  stadiumId?: string;
  setId?: string;
  packageId?: string;
  lineupCardIds?: string[];
  preferredClubId?: string;
}): Promise<{ template: CardTemplate | null, metadata?: any }> {
  const { source, matchId, stadiumId, packageId, preferredClubId } = input;
  
  try {
    const [allTemplates, resolvedFavoriteClubId, existingUserCards] = await Promise.all([
      pb.collection('card_templates').getFullList<CardTemplate>({
        filter: 'active = true',
      }),
      preferredClubId ? Promise.resolve(preferredClubId) : getFavoriteClubId(input.userId),
      getExistingUserCards(input.userId),
    ]);

    const ownedTemplateIds = new Set(existingUserCards.map((card) => card.template).filter(Boolean));
    const ownedClubIds = new Set(existingUserCards.map((card) => card.club).filter(Boolean));
    const favoriteClubTemplate = getClubTemplate(allTemplates, resolvedFavoriteClubId);
    const favoriteClubPlayers = getPlayerTemplatesForClub(allTemplates, resolvedFavoriteClubId);

    if (source === 'live_watch' && matchId) {
      // 1. Personalized PlayerCard from match teams
      if (packageId) {
          const personalized = await selectPersonalizedRewardCards({
              userId: input.userId,
              matchId,
              source: 'live_watch',
              packageId,
          });
          if (personalized.templates.length > 0) return { template: personalized.templates[0], metadata: personalized.metadata };
      }

      // 2. Fallback MatchCard
      const matchCard = allTemplates.find(t => t.type === 'match' && t.key === `match_${matchId}`);
      if (matchCard) return { template: matchCard, metadata: { fallbackUsed: true, fallbackReason: 'No personalized player cards available', source: input.source, matchId } };

      return { template: null };
    }

    if (source === 'stadium_checkin') {
      // Logic for first card (usually handled by the index in the loop, but here we return one)
      // If we need multiple, selectRewardCardTemplates should be used.
      
      if (stadiumId) {
        const stadiumCard = allTemplates.find(t => t.type === 'stadium' && t.key === `stadium_${stadiumId}`);
        if (stadiumCard) return { template: stadiumCard, metadata: { source: 'stadium_checkin', stadiumId } };
      }
      
      if (matchId && packageId) {
          const personalized = await selectPersonalizedRewardCards({
              userId: input.userId,
              matchId,
              source: 'stadium_checkin',
              packageId,
          });
          if (personalized.templates.length > 0) return { template: personalized.templates[0], metadata: personalized.metadata };
      }

      const matchCard = allTemplates.find(t => t.type === 'match' && (matchId ? t.key === `match_${matchId}` : true));
      if (matchCard) return { template: matchCard, metadata: { fallbackUsed: true, fallbackReason: 'No personalized player cards available', source: input.source, matchId } };

      return { template: null };
    }

    if (source === 'starter_pack') {
        if (favoriteClubTemplate && !ownedTemplateIds.has(favoriteClubTemplate.id) && !ownedClubIds.has(resolvedFavoriteClubId || '')) {
            return {
              template: favoriteClubTemplate,
              metadata: {
                source,
                selectionReason: 'Favorite club template for starter pack',
                preferredClubId: resolvedFavoriteClubId,
              },
            };
        }

        const favoriteClubPlayer = favoriteClubPlayers.find((template) => !ownedTemplateIds.has(template.id));
        if (favoriteClubPlayer) {
          return {
            template: favoriteClubPlayer,
            metadata: {
              source,
              selectionReason: 'Favorite club player template for starter pack',
              preferredClubId: resolvedFavoriteClubId,
            },
          };
        }

        const fallback = allTemplates.find((t) => t.type === 'player' && t.rarity === 'standard' && !ownedTemplateIds.has(t.id)) || null;
        return { template: fallback };
    }

    if (source === 'fan_five') {
        if (favoriteClubTemplate && !ownedTemplateIds.has(favoriteClubTemplate.id)) {
          return {
            template: favoriteClubTemplate,
            metadata: {
              source,
              selectionReason: 'Favorite club template for fan five',
              preferredClubId: resolvedFavoriteClubId,
            },
          };
        }

        const perfCard = allTemplates.find((t) => t.type === 'player' && t.rarity === 'rare' && !ownedTemplateIds.has(t.id));
        return { template: perfCard || null };
    }

    if (source === 'special_moment') {
        return { template: allTemplates.find(t => t.type === 'moment') || null };
    }

    // Default fallback
    return { template: allTemplates.find(t => t.type === 'player') || null };
  } catch (error) {
    console.error('[RewardEngine] Failed to select template', error);
    return { template: null };
  }
}

/**
 * Creates a RewardEvent record in PocketBase.
 */
export async function createRewardEvent(input: {
  userId: string;
  actionType: RewardSource;
  sourceType: RewardEvent['sourceType'];
  sourceId?: string;
  rewardType: RewardType;
  cardId?: string;
  xpAmount?: number;
  bondXpAmount?: number;
  status: RewardEvent['status'];
  metadata?: any;
}): Promise<RewardEvent> {
  const payload: Omit<RewardEvent, 'id' | 'createdAt'> = {
    user: input.userId,
    actionType: input.actionType as any,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    rewardType: input.rewardType as any,
    card: input.cardId,
    xpAmount: input.xpAmount,
    bondXpAmount: input.bondXpAmount,
    status: input.status,
    metadata: typeof input.metadata === 'string' ? input.metadata : JSON.stringify(input.metadata || {}),
  };

  return await pb.collection('reward_events').create<RewardEvent>(payload);
}

/**
 * Grants rewards for a Clash session.
 */
export async function grantClashRewards(input: {
  userId: string;
  result: 'win' | 'lose' | 'draw';
  cardIds: string[];
}): Promise<RewardResult> {
  const { win, lose, draw } = require('../config/rewardEconomy').CLASH_REWARDS;
  const rewards = input.result === 'win' ? win : input.result === 'lose' ? lose : draw;
  
  await incrementUserXp(input.userId, rewards.xp);
  
  // Log events
  await createRewardEvent({
    userId: input.userId,
    actionType: 'clash',
    sourceType: 'pack', // Source is the clash session
    rewardType: 'xp',
    xpAmount: rewards.xp,
    status: 'granted',
  });

  await createRewardEvent({
    userId: input.userId,
    actionType: 'clash',
    sourceType: 'pack',
    rewardType: 'bond_xp',
    bondXpAmount: rewards.connectionXp,
    status: 'granted',
    metadata: { cardIds: input.cardIds },
  });

  return {
    rewards: [
      { id: 'xp', type: 'xp', title: `+${rewards.xp} XP`, amount: rewards.xp },
      { id: 'connection_xp', type: 'connection_xp', title: `+${rewards.connectionXp} Verbindungs-XP`, amount: rewards.connectionXp },
      { id: 'clash_points', type: 'clash_points', title: `+${rewards.clashPoints} Clash Points`, amount: rewards.clashPoints },
    ],
    xpAmount: rewards.xp,
    connectionXpAmount: rewards.connectionXp,
    clashPoints: rewards.clashPoints,
  };
}

/**
 * Grants rewards for a Fan Five gameweek/performance.
 */
export async function grantFanFiveRewards(input: {
  userId: string;
  tier: 'participation' | 'top50' | 'top25' | 'top10';
  gameweekId: string;
}): Promise<RewardResult> {
  const { FAN_FIVE_TIER_REWARDS } = require('../config/rewardEconomy');
  const rewards = FAN_FIVE_TIER_REWARDS[input.tier];
  const results: PackageReward[] = [];

  await incrementUserXp(input.userId, rewards.xp);
  results.push({ id: 'xp', type: 'xp', title: `+${rewards.xp} XP`, amount: rewards.xp });
  results.push({ id: 'connection_xp', type: 'connection_xp', title: `+${rewards.connectionXp} Verbindungs-XP`, amount: rewards.connectionXp });

  if (rewards.fanFivePoints) {
    results.push({ id: 'fan_five_points', type: 'fan_five_points', title: `+${rewards.fanFivePoints} Fan Five Points`, amount: rewards.fanFivePoints });
  }

  let packageId: string | undefined;
  if (rewards.package) {
      const pkg = await require('./rewardPackageService').createRewardPackage({
          userId: input.userId,
          source: 'fan_five',
          sourceId: input.gameweekId,
      });
      packageId = pkg.id;
      results.push({ id: 'package', type: 'package', title: 'Reward Package erhalten' });
  }

  return {
    rewards: results,
    packageId,
    xpAmount: rewards.xp,
    connectionXpAmount: rewards.connectionXp,
    fanFivePoints: rewards.fanFivePoints,
  };
}

/**
 * Grants rewards for completing a Card Set.
 */
export async function grantSetCompletionRewards(input: {
  userId: string;
  setId: string;
}): Promise<RewardResult> {
  const alreadyClaimed = await hasRewardEvent(input.userId, 'set_completion', input.setId);
  if (alreadyClaimed) {
      throw new Error('Belohnung für dieses Set wurde bereits beansprucht.');
  }

  const { REWARD_ECONOMY_CONFIG } = require('../config/rewardEconomy');
  const config = REWARD_ECONOMY_CONFIG.set_completion;
  const xpReward = config.rewards.find((r: RewardDefinition) => r.type === 'xp');

  if (xpReward) {
      await incrementUserXp(input.userId, xpReward.amount || 0);
      await createRewardEvent({
          userId: input.userId,
          actionType: 'set_completion',
          sourceType: 'card_set',
          sourceId: input.setId,
          rewardType: 'xp',
          xpAmount: xpReward.amount,
          status: 'granted',
      });
  }

  return {
    rewards: [
      { id: 'xp', type: 'xp', title: `+${xpReward?.amount || 250} XP`, amount: xpReward?.amount || 250 },
      // TODO: Add Badge and Frame once implemented
    ],
    xpAmount: xpReward?.amount || 250,
  };
}

/**
 * Creates a UserCard from a template with standard reward fields.
 */
export async function createRewardUserCard(input: {
  userId: string;
  template: CardTemplate;
  origin: UserCard['origin'];
  verificationType: VerificationType;
  matchId?: string;
  stadiumId?: string;
  setId?: string;
  packageId?: string;
  rarity?: RewardRarity;
}): Promise<UserCard> {
  const now = new Date().toISOString();
  let visualConfig: Record<string, unknown> | null = null;

  if (input.template.visualConfig) {
    try {
      visualConfig = JSON.parse(input.template.visualConfig);
    } catch {
      visualConfig = null;
    }
  }

  const entityType = typeof visualConfig?.entityType === 'string' ? visualConfig.entityType : undefined;
  const entityId = typeof visualConfig?.entityId === 'string' ? visualConfig.entityId : undefined;
  const templateMatchId = typeof visualConfig?.matchId === 'string' ? visualConfig.matchId : undefined;
  const templateStadiumId = typeof visualConfig?.stadiumId === 'string' ? visualConfig.stadiumId : undefined;
  const templateClubId = typeof visualConfig?.clubId === 'string' ? visualConfig.clubId : undefined;
  const templatePlayerId = typeof visualConfig?.playerId === 'string' ? visualConfig.playerId : undefined;
  
  const payload: Omit<UserCard, 'id'> = {
    user: input.userId,
    template: input.template.id,
    type: input.template.type,
    title: input.template.name,
    subtitle: getVerificationLabel(input.verificationType),
    rarity: (input.rarity || input.template.rarity) as any,
    origin: input.origin,
    acquiredAt: now,
    match: input.matchId || templateMatchId || (entityType === 'match' ? entityId : undefined),
    player: templatePlayerId || (entityType === 'player' ? entityId : undefined),
    stadium: input.stadiumId || templateStadiumId || (entityType === 'stadium' ? entityId : undefined),
    club: templateClubId || (entityType === 'club' ? entityId : undefined),
    tradable: false,
    bound: true,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 1,
    archived: true,
    favorite: false,
  };

  const card = await pb.collection('user_cards').create<UserCard>(payload);

  // Log card creation event
  await pb.collection('card_events').create({
    user: input.userId,
    card: card.id,
    eventType: 'earned',
    title: 'Reward erhalten',
    description: `${card.title} wurde verdient.`,
    relatedMatch: input.matchId,
    createdAt: now,
  });

  return card;
}

/**
 * Increments global Fan XP for a user.
 */
export async function incrementUserXp(userId: string, amount: number) {
  if (amount <= 0) return;
  try {
    const user = await pb.collection('users').getOne(userId);
    const currentFanXp = typeof user.fanXp === 'number' ? user.fanXp : 0;
    await pb.collection('users').update(userId, { fanXp: currentFanXp + amount });
  } catch (error) {
    console.error('[RewardEngine] Failed to increment user XP', error);
  }
}

/**
 * Checks if a specific reward has already been granted.
 */
export async function hasRewardEvent(userId: string, actionType: RewardSource, sourceId: string): Promise<boolean> {
  if (!(await canReadRewardEvents())) return false;
  try {
    const records = await pb.collection('reward_events').getFullList({
      filter: `user = "${userId}" && actionType = "${actionType}" && sourceId = "${sourceId}" && status = "granted"`,
      limit: 1,
    });
    return records.length > 0;
  } catch {
    return false;
  }
}

function getVerificationLabel(type: VerificationType): string {
  switch (type) {
    case 'live_verified': return 'Live Verified';
    case 'stadium_verified': return 'Stadium Verified';
    case 'starter': return 'Starter Card';
    case 'performance': return 'Performance Reward';
    case 'clash': return 'Clash Reward';
    case 'set_completion': return 'Set Bonus';
    case 'special_moment': return 'Special Moment';
    default: return 'Earned';
  }
}

async function canReadRewardEvents() {
  if (rewardEventsReadable !== undefined) return rewardEventsReadable;
  try {
    await pb.collection('reward_events').getList(1, 1, { skipTotal: true });
    rewardEventsReadable = true;
  } catch {
    rewardEventsReadable = false;
  }
  return rewardEventsReadable;
}
