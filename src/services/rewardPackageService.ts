import { checkAchievements } from '@/src/services/achievementService';
import { getMatchById } from '@/src/services/matchService';
import { pb } from '@/src/services/pocketbase';
import {
  createRewardEvent,
  createRewardUserCard,
  incrementUserXp,
  selectRewardCardTemplate,
} from '@/src/services/rewardEngineService';
import { REWARD_ECONOMY_CONFIG } from '@/src/config/rewardEconomy';
import type { RewardEvent, UserCard } from '@/src/types/models';
import type { RewardSource, PackageReward, RewardPackageOpenResult } from '@/src/types/rewards';

export * from '@/src/types/rewards';

export type RewardPackageStatus = 'unopened' | 'opening' | 'opened' | 'expired';

export type RewardPackage = {
  id: string;
  userId: string;
  sourceType: RewardSource;
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

const COLLECTION = 'reward_packages';
let rewardPackagesReadable: boolean | undefined;

export async function getUnopenedRewardPackages(userId: string): Promise<RewardPackage[]> {
  if (!(await canReadRewardPackages())) return [];
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
  if (!(await canReadRewardPackages())) return null;
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
  sourceType: RewardSource;
}): Promise<RewardPackage | null> {
  if (!(await canReadRewardPackages())) return null;
  try {
    const records = await pb.collection(COLLECTION).getFullList({
      filter: `user = "${input.userId}" && sourceType = "${input.sourceType}" && match = "${input.matchId}"`,
      sort: '-createdAt',
    });
    return records[0] ? fromRecord(records[0]) : null;
  } catch {
    return null;
  }
}

export async function createRewardPackage(input: {
  userId: string;
  source: RewardSource;
  sourceId?: string;
  matchId?: string;
}): Promise<RewardPackage> {
  const config = REWARD_ECONOMY_CONFIG[input.source];
  if (!config) throw new Error(`Keine Konfiguration für Reward Source "${input.source}" gefunden.`);

  // Check for existing package to avoid duplicates
  if (input.sourceId) {
    const existing = await pb.collection(COLLECTION).getFullList({
        filter: `user = "${input.userId}" && sourceType = "${input.source}" && sourceId = "${input.sourceId}"`,
        limit: 1,
    });
    if (existing.length > 0) return fromRecord(existing[0]);
  }

  const payload = {
    user: input.userId,
    sourceType: input.source,
    sourceId: input.sourceId,
    match: input.matchId,
    status: 'unopened',
    title: config.title,
    subtitle: config.subtitle,
    rewardCount: config.rewardCount,
    createdAt: new Date().toISOString(),
    metadata: JSON.stringify({
        planned: true,
        matchId: input.matchId,
    })
  };

  const record = await pb.collection(COLLECTION).create(payload);
  return fromRecord(record);
}

export async function openRewardPackage(input: {
  userId: string;
  packageId: string;
}): Promise<RewardPackageOpenResult> {
  const rewardPackage = await getRewardPackage(input.packageId, input.userId);
  if (!rewardPackage) throw new Error('Reward Package wurde nicht gefunden.');

  if (rewardPackage.status === 'opened') {
    return {
      package: rewardPackage,
      rewards: getRewardsFromMetadata(rewardPackage),
      alreadyOpened: true,
    };
  }

  const config = REWARD_ECONOMY_CONFIG[rewardPackage.sourceType];
  const rewards: PackageReward[] = [];

  for (let i = 0; i < config.rewards.length; i++) {
    const def = config.rewards[i];
    const rewardId = `reward-${rewardPackage.id}-${i}`;

    if (def.type === 'card') {
      const { template, metadata: selectionMetadata } = await selectRewardCardTemplate({
        source: rewardPackage.sourceType,
        userId: rewardPackage.userId,
        matchId: rewardPackage.matchId,
        packageId: rewardPackage.id,
      });

      if (template) {
        const userCard = await createRewardUserCard({
          userId: rewardPackage.userId,
          template,
          origin: def.origin,
          verificationType: def.verificationType || 'special_moment',
          matchId: rewardPackage.matchId,
          packageId: rewardPackage.id,
        });

        const event = await createRewardEvent({
            userId: rewardPackage.userId,
            actionType: rewardPackage.sourceType,
            sourceType: 'pack',
            sourceId: rewardPackage.id,
            rewardType: 'card',
            cardId: userCard.id,
            status: 'granted',
            metadata: selectionMetadata,
        });
        
        // Ensure package metadata includes this for the UI if missing
        if (!rewardPackage.metadata) rewardPackage.metadata = {};
        if (selectionMetadata) {
            rewardPackage.metadata.selectionDebug = selectionMetadata;
        }

        rewards.push({
          id: rewardId,
          type: 'card',
          title: userCard.title,
          subtitle: userCard.subtitle,
          userCard,
          rewardEvent: event,
        });
      } else {
          // Fallback if no card template found - don't create fake card
          rewards.push({
              id: rewardId,
              type: 'xp',
              title: '+50 XP',
              subtitle: 'Kompensation (Keine Card verfügbar)',
              amount: 50,
          });
          await incrementUserXp(rewardPackage.userId, 50);
      }
    } else if (def.type === 'xp') {
      await incrementUserXp(rewardPackage.userId, def.amount || 0);
      const event = await createRewardEvent({
        userId: rewardPackage.userId,
        actionType: rewardPackage.sourceType,
        sourceType: 'pack',
        sourceId: rewardPackage.id,
        rewardType: 'xp',
        xpAmount: def.amount,
        status: 'granted',
      });
      rewards.push({
        id: rewardId,
        type: 'xp',
        title: `+${def.amount} XP`,
        subtitle: 'User XP',
        amount: def.amount,
        rewardEvent: event,
      });
    } else if (def.type === 'connection_xp') {
      const event = await createRewardEvent({
        userId: rewardPackage.userId,
        actionType: rewardPackage.sourceType,
        sourceType: 'pack',
        sourceId: rewardPackage.id,
        rewardType: 'bond_xp',
        bondXpAmount: def.amount,
        status: 'granted',
      });
      rewards.push({
        id: rewardId,
        type: 'connection_xp',
        title: `+${def.amount} Verbindungs-XP`,
        subtitle: 'Verbindung wächst',
        amount: def.amount,
        rewardEvent: event,
      });
    }
  }

  // Update package status
  const updatedRecord = await pb.collection(COLLECTION).update(rewardPackage.id, {
    status: 'opened',
    openedAt: new Date().toISOString(),
    metadata: JSON.stringify({ ...(rewardPackage.metadata || {}), rewards: serializeRewards(rewards) }),
  });

  await checkAchievements(input.userId).catch(() => undefined);
  return { package: fromRecord(updatedRecord), rewards };
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
    metadata: typeof record.metadata === 'string' ? JSON.parse(record.metadata || '{}') : record.metadata,
  };
}

function serializeRewards(rewards: PackageReward[]) {
  return rewards.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    subtitle: r.subtitle,
    amount: r.amount,
    userCardId: r.userCard?.id,
    rewardEventId: r.rewardEvent?.id,
  }));
}

function getRewardsFromMetadata(pkg: RewardPackage): PackageReward[] {
  const data = pkg.metadata?.rewards;
  if (!Array.isArray(data)) return [];
  return data as PackageReward[];
}

async function canReadRewardPackages() {
  if (rewardPackagesReadable !== undefined) return rewardPackagesReadable;
  try {
    await pb.collection(COLLECTION).getList(1, 1, { skipTotal: true });
    rewardPackagesReadable = true;
  } catch {
    rewardPackagesReadable = false;
  }
  return rewardPackagesReadable;
}