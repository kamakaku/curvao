import { checkAchievements } from '@/src/services/achievementService';
import { getMatchById } from '@/src/services/matchService';
import { pb } from '@/src/services/pocketbase';
import {
  createRewardUserCardFromTemplate,
  selectLiveWatchRewardCardTemplate,
  selectStadiumCheckinRewardCardTemplate,
} from '@/src/services/rewardEngineService';
import type { RewardEvent, UserCard } from '@/src/types/models';

export type RewardPackageSourceType = 'live_watch' | 'starter_pack' | 'stadium_checkin' | 'set_completion';
export type RewardPackageStatus = 'unopened' | 'opening' | 'opened' | 'expired';

export type RewardPackage = {
  id: string;
  userId: string;
  sourceType: RewardPackageSourceType;
  sourceId?: string;
  matchId?: string;
  status: RewardPackageStatus;
  title: string;
  subtitle?: string;
  rewardCount: number;
  createdAt: string;
  openedAt?: string;
  metadata?: Record<string, unknown>;
};

export type PackageReward = {
  id: string;
  type: 'card' | 'xp' | 'bond_xp' | 'badge' | 'pack';
  title: string;
  subtitle?: string;
  amount?: number;
  userCard?: UserCard;
  rewardEvent?: RewardEvent;
  rarity?: string;
};

export type RewardPackageOpenResult = {
  package: RewardPackage;
  rewards: PackageReward[];
  alreadyOpened?: boolean;
};

const COLLECTION = 'reward_packages';
const LIVE_WATCH_XP = 100;
const LIVE_WATCH_BOND_XP = 25;
const STADIUM_CHECKIN_XP = 250;
const STADIUM_CHECKIN_BOND_XP = 75;
let rewardPackagesReadable: boolean | undefined;

export async function getUnopenedRewardPackages(userId: string): Promise<RewardPackage[]> {
  if (!(await canReadRewardPackages())) {
    return [];
  }

  try {
    const records = await pb.collection(COLLECTION).getFullList({
      filter: `user = "${userId}" && status = "unopened"`,
      sort: '-createdAt',
    });
    return records.map(fromRecord);
  } catch {
    return [];
  }
}

export async function getRewardPackage(packageId: string, userId?: string): Promise<RewardPackage | null> {
  if (!(await canReadRewardPackages())) {
    return null;
  }

  try {
    const record = await pb.collection(COLLECTION).getOne(packageId);
    const rewardPackage = fromRecord(record);
    if (userId && rewardPackage.userId !== userId) return null;
    return rewardPackage;
  } catch {
    return null;
  }
}

export async function getRewardPackageForMatch(input: {
  userId: string;
  matchId: string;
  sourceType: 'live_watch' | 'stadium_checkin';
}): Promise<RewardPackage | null> {
  if (!(await canReadRewardPackages())) {
    return null;
  }

  try {
    const records = await pb.collection(COLLECTION).getFullList({
      filter: [
        `user = "${input.userId}"`,
        `sourceType = "${input.sourceType}"`,
        `sourceId = "${input.matchId}"`,
      ].join(' && '),
      sort: '-createdAt',
    });
    return records[0] ? fromRecord(records[0]) : null;
  } catch {
    return null;
  }
}

export async function createStadiumCheckinRewardPackage(input: {
  userId: string;
  matchId: string;
}): Promise<RewardPackage> {
  const existingPackage = await getRewardPackageForMatch({
    userId: input.userId,
    matchId: input.matchId,
    sourceType: 'stadium_checkin',
  });
  if (existingPackage) return existingPackage;

  const match = await getMatchById(input.matchId);
  
  const payload = {
    user: input.userId,
    sourceType: 'stadium_checkin',
    sourceId: input.matchId,
    match: input.matchId,
    status: 'unopened',
    title: 'Stadium Check-in Reward',
    subtitle: match ? `${match.expand?.homeClub?.name || 'Home'} vs ${match.expand?.awayClub?.name || 'Away'}` : 'Stadium Verified Reward',
    rewardCount: 4,
    createdAt: new Date().toISOString(),
    metadata: {
      earnedBy: 'stadium_checkin',
      premium: true,
    },
  };

  const record = await pb.collection(COLLECTION).create(payload);
  return fromRecord(record);
}

export async function createLiveWatchRewardPackage(input: {
  userId: string;
  matchId: string;
  sessionId: string;
}): Promise<RewardPackage> {
  const existingPackage = await getRewardPackageForMatch({
    userId: input.userId,
    matchId: input.matchId,
    sourceType: 'live_watch',
  });
  if (existingPackage) return existingPackage;

  const match = await getMatchById(input.matchId);
  
  const payload = {
    user: input.userId,
    sourceType: 'live_watch',
    sourceId: input.matchId,
    match: input.matchId,
    status: 'unopened',
    title: 'Live Watch Reward',
    subtitle: match ? `${match.expand?.homeClub?.name || 'Home'} vs ${match.expand?.awayClub?.name || 'Away'}` : 'Matchday Reward',
    rewardCount: 3,
    createdAt: new Date().toISOString(),
    metadata: {
      sessionId: input.sessionId,
      earnedBy: 'live_watch',
    },
  };

  const record = await pb.collection(COLLECTION).create(payload);
  return fromRecord(record);
}

export async function openRewardPackage(input: {
  userId: string;
  packageId: string;
}): Promise<RewardPackageOpenResult> {
  const rewardPackage = await getRewardPackage(input.packageId, input.userId);
  if (!rewardPackage) {
    throw new Error('Reward Package wurde nicht gefunden.');
  }

  if (rewardPackage.status === 'opened') {
    const rewards = getRewardsFromPackageMetadata(rewardPackage);
    return {
      package: rewardPackage,
      rewards,
      alreadyOpened: true,
    };
  }

  // Update status to opened
  const rewards = await createPackageRewards(rewardPackage);
  const updatedRecord = await pb.collection(COLLECTION).update(rewardPackage.id, {
    status: 'opened',
    openedAt: new Date().toISOString(),
    metadata: {
      ...rewardPackage.metadata,
      rewards: serializeRewards(rewards),
    },
  });
  
  await checkAchievements(input.userId).catch(() => undefined);
  return { package: fromRecord(updatedRecord), rewards };
}

async function createPackageRewards(rewardPackage: RewardPackage): Promise<PackageReward[]> {
  if (rewardPackage.sourceType === 'stadium_checkin') {
    return createStadiumCheckinPackageRewards(rewardPackage);
  }

  const rewards: PackageReward[] = [];
  
  const template = await selectLiveWatchRewardCardTemplate({
    userId: rewardPackage.userId,
    matchId: rewardPackage.matchId!,
  });

  if (template) {
    const userCard = await createRewardUserCardFromTemplate({
      userId: rewardPackage.userId,
      matchId: rewardPackage.matchId!,
      template,
      bondXpAmount: LIVE_WATCH_BOND_XP,
    });
    rewards.push({
      id: `reward-card-${userCard.id}`,
      type: 'card',
      title: userCard.title,
      subtitle: userCard.subtitle,
      userCard,
      rarity: userCard.rarity,
    });
  }

  rewards.push({
    id: `reward-xp-${rewardPackage.id}`,
    type: 'xp',
    title: '+100 XP',
    subtitle: 'User XP',
    amount: LIVE_WATCH_XP,
  });

  rewards.push({
    id: `reward-bond-${rewardPackage.id}`,
    type: 'bond_xp',
    title: '+25 Bond XP',
    subtitle: 'Live Verified Bond',
    amount: LIVE_WATCH_BOND_XP,
  });

  await incrementUserXp(rewardPackage.userId, LIVE_WATCH_XP);
  return rewards;
}

async function createStadiumCheckinPackageRewards(rewardPackage: RewardPackage): Promise<PackageReward[]> {
  const rewards: PackageReward[] = [];
  const template = await selectStadiumCheckinRewardCardTemplate();

  if (template) {
    const userCard = await createRewardUserCardFromTemplate({
      userId: rewardPackage.userId,
      matchId: rewardPackage.matchId!,
      template,
      bondXpAmount: STADIUM_CHECKIN_BOND_XP,
      origin: 'stadium_verified',
    });
    rewards.push({
      id: `reward-card-${userCard.id}`,
      type: 'card',
      title: userCard.title,
      subtitle: userCard.subtitle,
      userCard,
      rarity: userCard.rarity,
    });
  }

  rewards.push({
    id: `reward-xp-${rewardPackage.id}`,
    type: 'xp',
    title: `+${STADIUM_CHECKIN_XP} XP`,
    subtitle: 'Stadium Bonus',
    amount: STADIUM_CHECKIN_XP,
  });

  rewards.push({
    id: `reward-bond-${rewardPackage.id}`,
    type: 'bond_xp',
    title: `+${STADIUM_CHECKIN_BOND_XP} Bond XP`,
    subtitle: 'Stadium Verified Bonus',
    amount: STADIUM_CHECKIN_BOND_XP,
  });

  await incrementUserXp(rewardPackage.userId, STADIUM_CHECKIN_XP);
  return rewards;
}

function fromRecord(record: any): RewardPackage {
  return {
    id: record.id,
    userId: record.user,
    sourceType: record.sourceType,
    sourceId: record.sourceId,
    matchId: record.match,
    status: record.status,
    title: record.title,
    subtitle: record.subtitle,
    rewardCount: record.rewardCount || 0,
    createdAt: record.createdAt ?? record.created,
    openedAt: record.openedAt,
    metadata: parseMetadata(record.metadata),
  };
}

function parseMetadata(metadata: unknown): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  if (typeof metadata === 'object') return metadata as Record<string, unknown>;
  try {
    return JSON.parse(metadata as string);
  } catch {
    return undefined;
  }
}

function getRewardsFromPackageMetadata(rewardPackage: RewardPackage) {
  const rewards = rewardPackage.metadata?.rewards;
  return Array.isArray(rewards) ? (rewards as PackageReward[]) : [];
}

function serializeRewards(rewards: PackageReward[]) {
  return rewards.map((reward) => ({
    id: reward.id,
    type: reward.type,
    title: reward.title,
    subtitle: reward.subtitle,
    amount: reward.amount,
    userCard: reward.userCard ? { id: reward.userCard.id } : undefined,
    rarity: reward.rarity,
  }));
}

async function incrementUserXp(userId: string, xpAmount: number) {
  try {
    const user = await pb.collection('users').getOne(userId);
    const currentFanXp = typeof user.fanXp === 'number' ? user.fanXp : 0;
    await pb.collection('users').update(userId, { fanXp: currentFanXp + xpAmount });
  } catch (error) {
    console.error('Failed to increment XP', error);
  }
}

async function canReadRewardPackages() {
  if (rewardPackagesReadable !== undefined) {
    return rewardPackagesReadable;
  }

  try {
    await pb.collection(COLLECTION).getList(1, 1, { skipTotal: true });
    rewardPackagesReadable = true;
  } catch (error) {
    rewardPackagesReadable = !isCollectionMissingError(error);
  }

  return rewardPackagesReadable;
}

function isCollectionMissingError(error: unknown) {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number((error as { status?: number }).status) === 404,
  );
}
