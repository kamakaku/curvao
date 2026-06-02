import { RewardPackageDefinition, RewardSource } from '../types/rewards';

export const REWARD_ECONOMY_CONFIG: Record<RewardSource, RewardPackageDefinition> = {
  starter_pack: {
    source: 'starter_pack',
    title: 'Starter Pack',
    subtitle: 'Dein Einstieg bei CURVAO',
    rewardCount: 2,
    rewards: [
      {
        type: 'card',
        rarity: 'standard',
        origin: 'starter_pack',
        verificationType: 'starter',
        bound: true,
        tradable: false,
        archived: false,
      },
      {
        type: 'card',
        rarity: 'standard',
        origin: 'starter_pack',
        verificationType: 'starter',
        bound: true,
        tradable: false,
        archived: false,
      },
    ],
  },
  live_watch: {
    source: 'live_watch',
    title: 'Live Watch Reward',
    subtitle: 'Matchday Belohnung',
    rewardCount: 3,
    rewards: [
      {
        type: 'card',
        origin: 'live_verified',
        verificationType: 'live_verified',
        bound: true,
        tradable: false,
        archived: true,
      },
      {
        type: 'xp',
        amount: 100,
        origin: 'live_verified',
      },
      {
        type: 'connection_xp',
        amount: 25,
        origin: 'live_verified',
      },
    ],
  },
  stadium_checkin: {
    source: 'stadium_checkin',
    title: 'Stadium Check-in Reward',
    subtitle: 'Stadium Verified Belohnung',
    rewardCount: 4,
    rewards: [
      {
        type: 'card',
        origin: 'stadium_verified',
        verificationType: 'stadium_verified',
        bound: true,
        tradable: false,
        archived: true,
      },
      {
        type: 'card',
        origin: 'stadium_verified',
        verificationType: 'stadium_verified',
        bound: true,
        tradable: false,
        archived: true,
      },
      {
        type: 'xp',
        amount: 200,
        origin: 'stadium_verified',
      },
      {
        type: 'connection_xp',
        amount: 50,
        origin: 'stadium_verified',
      },
    ],
  },
  clash: {
    source: 'clash',
    title: 'Clash Result',
    rewardCount: 0, // No package by default
    rewards: [],
  },
  fan_five: {
    source: 'fan_five',
    title: 'Fan Five Reward',
    rewardCount: 3, // For top 10%
    rewards: [
      {
        type: 'card',
        origin: 'club_reward',
        verificationType: 'performance',
        bound: true,
        tradable: false,
        archived: false,
      },
      {
        type: 'xp',
        amount: 150,
        origin: 'club_reward',
      },
      {
        type: 'connection_xp',
        amount: 25,
        origin: 'club_reward',
      },
    ],
  },
  set_completion: {
    source: 'set_completion',
    title: 'Set Completion Bonus',
    rewardCount: 1,
    rewards: [
      {
        type: 'xp',
        amount: 250,
        origin: 'season_reward',
        verificationType: 'set_completion',
      },
    ],
  },
  special_moment: {
    source: 'special_moment',
    title: 'Special Moment',
    rewardCount: 1,
    rewards: [
      {
        type: 'card',
        rarity: 'moment',
        origin: 'special_moment',
        verificationType: 'special_moment',
        bound: true,
        tradable: false,
        archived: false,
      },
    ],
  },
};

export const CLASH_REWARDS = {
  win: { xp: 100, clashPoints: 25, connectionXp: 10 },
  lose: { xp: 35, clashPoints: 5, connectionXp: 3 },
  draw: { xp: 60, clashPoints: 10, connectionXp: 5 },
};

export const FAN_FIVE_TIER_REWARDS = {
  participation: { xp: 50, connectionXp: 5 },
  top50: { xp: 100, connectionXp: 10 },
  top25: { xp: 150, connectionXp: 20, fanFivePoints: 10 },
  top10: { xp: 150, connectionXp: 25, package: true },
};
