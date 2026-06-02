import { RewardSource, RewardType, PackageReward } from '../types/rewards';
import { REWARD_ECONOMY_CONFIG } from '../config/rewardEconomy';

export function getRewardTitle(type: RewardType, amount?: number): string {
  switch (type) {
    case 'xp':
      return `+${amount} XP`;
    case 'connection_xp':
      return `+${amount} Verbindungs-XP`;
    case 'clash_points':
      return `+${amount} Clash Points`;
    case 'fan_five_points':
      return `+${amount} Fan Five Points`;
    case 'card':
      return 'Card Reward';
    case 'badge':
      return 'Badge verdient';
    case 'package':
      return 'Reward Package';
    default:
      return 'Reward';
  }
}

export function getRewardSubtitle(source: RewardSource): string {
  const config = REWARD_ECONOMY_CONFIG[source];
  return config?.subtitle || 'Earned Reward';
}
