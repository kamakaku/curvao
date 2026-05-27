import { pb } from '@/src/services/pocketbase';

export type UserProgress = {
  level: number;
  xp: number;
  nextLevelXp: number;
  cardsCount: number;
  cardsTarget?: number;
  badgesCount: number;
  badgesTarget?: number;
  streakDays: number;
  bestStreakDays?: number;
  ranking: number;
  rankingPercentile?: number;
  targetRankingPercentile?: number;
};

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const [userRecord, cards, achievements, totalPlayers, totalAchievements] = await Promise.all([
    pb.collection('users').getOne(userId),
    pb.collection('user_cards').getFullList({ filter: `user = "${userId}"`, fields: 'id' }),
    pb.collection('user_achievements').getFullList({ filter: `user = "${userId}"`, fields: 'id' }),
    pb.collection('players').getFullList({ filter: 'active = true', fields: 'id' }),
    pb.collection('achievements').getFullList({ filter: 'active = true', fields: 'id' }),
  ]);

  const xp = userRecord.fanXp || 0;
  const level = Math.floor(xp / 1000) + 1; 
  const nextLevelXp = level * 1000;
  
  return {
    level,
    xp,
    nextLevelXp,
    cardsCount: cards.length,
    cardsTarget: totalPlayers.length || 1, // Dynamically based on available players
    badgesCount: achievements.length,
    badgesTarget: totalAchievements.length || 1, // Dynamically based on available achievements
    streakDays: userRecord.streakDays || 0,
    bestStreakDays: userRecord.bestStreakDays || 0,
    ranking: userRecord.ranking || 0,
    rankingPercentile: userRecord.rankingPercentile || 0,
    targetRankingPercentile: 10,
  };
}
