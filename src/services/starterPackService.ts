import { createRewardPackage, type RewardPackage } from '@/src/services/rewardPackageService';
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
  rewardPackage?: RewardPackage | null;
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
  const [existingCards, userRecord, rewardPackages] = await Promise.all([
      getExistingStarterPackCards(userId),
      getStarterPackUserState(userId),
      pb.collection('reward_packages').getFullList({
          filter: `user = "${userId}" && sourceType = "starter_pack"`,
          limit: 1,
      })
  ]);

  if (existingCards.length > 0) {
    return {
      opened: true,
      pending: false,
      unopenedPackCount: 0,
      existingCards,
    };
  }

  const rewardPackage = rewardPackages[0] ? (rewardPackages[0] as any as RewardPackage) : null;
  const opened = userRecord?.starterPackOpened === true || rewardPackage?.status === 'opened';

  return {
    opened,
    pending: !opened,
    unopenedPackCount: (opened || rewardPackage) ? 0 : 1,
    existingCards,
    rewardPackage,
  };
}

export async function createStarterPackCards(input: CreateStarterPackCardsInput): Promise<RewardPackage> {
  const availability = await getStarterPackAvailability(input.userId);
  if (availability.rewardPackage) {
      return availability.rewardPackage;
  }

  return await createRewardPackage({
      userId: input.userId,
      source: 'starter_pack',
  });
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
