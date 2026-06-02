import type { CardOrigin, Rarity, RewardEvent, UserCard } from './models';

export type RewardSource =
  | 'starter_pack'
  | 'live_watch'
  | 'stadium_checkin'
  | 'clash'
  | 'fan_five'
  | 'set_completion'
  | 'special_moment';

export type RewardType =
  | 'card'
  | 'xp'
  | 'bond_xp'
  | 'connection_xp'
  | 'clash_points'
  | 'fan_five_points'
  | 'badge'
  | 'frame'
  | 'package';

export type VerificationType =
  | 'starter'
  | 'live_verified'
  | 'stadium_verified'
  | 'performance'
  | 'clash'
  | 'set_completion'
  | 'special_moment';

export type RewardRarity = Rarity | 'moment' | 'special';

export type RewardDefinition = {
  type: RewardType;
  amount?: number;
  cardPool?: string;
  rarity?: RewardRarity;
  origin: CardOrigin;
  verificationType?: VerificationType;
  bound?: boolean;
  tradable?: boolean;
  archived?: boolean;
  metadata?: Record<string, unknown>;
};

export type RewardPackageDefinition = {
  source: RewardSource;
  title: string;
  subtitle?: string;
  rewardCount: number;
  rewards: RewardDefinition[];
};

export type PackageReward = {
  id: string;
  type: RewardType;
  title: string;
  subtitle?: string;
  amount?: number;
  userCard?: UserCard;
  rewardEvent?: RewardEvent;
  rarity?: string;
};

export type RewardPackageOpenResult = {
  package: any; // Using any to avoid circular dependency with RewardPackage
  rewards: PackageReward[];
  alreadyOpened?: boolean;
};

export type RewardResult = {
  rewards: PackageReward[];
  packageId?: string;
  xpAmount?: number;
  connectionXpAmount?: number;
  clashPoints?: number;
  fanFivePoints?: number;
  userCards?: UserCard[];
  rewardEvents?: RewardEvent[];
};
