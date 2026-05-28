import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { Achievement, Checkin, FanStats, UserAchievement, UserCard } from '@/src/types/models';

export async function getAchievements(): Promise<Achievement[]> {
  return tryPocketBase(
    async () => pb.collection('achievements').getFullList<Achievement>({ filter: 'active = true' }),
    () => [],
  );
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  return tryPocketBase(
    async () => pb.collection('user_achievements').getFullList<UserAchievement>({ filter: `user = "${userId}"` }),
    () => [],
  );
}

export async function getFanStats(userId: string): Promise<FanStats> {
  const [cards, checkins, achievements] = await tryPocketBase(
    async () =>
      Promise.all([
        pb.collection('user_cards').getFullList<UserCard>({ filter: `user = "${userId}"` }),
        pb.collection('checkins').getFullList<Checkin>({ filter: `user = "${userId}"` }),
        pb.collection('user_achievements').getFullList<UserAchievement>({ filter: `user = "${userId}"` }),
      ]),
    async () => [
      [],
      [],
      [],
    ],
  );

  return {
    verifiedMatches: new Set(cards.filter((card) => card.type === 'match').map((card) => card.match)).size,
    stadiumCheckins: checkins.filter((checkin) => checkin.type === 'stadium').length,
    loggedViewings: checkins.filter((checkin) => checkin.type === 'viewing').length,
    totalCards: cards.length,
    playerCards: cards.filter((card) => card.type === 'player').length,
    matchCards: cards.filter((card) => card.type === 'match').length,
    boundCards: cards.filter((card) => card.bound).length,
    achievements: achievements.length,
  };
}

export async function checkAchievements(userId: string): Promise<UserAchievement[]> {
  return tryPocketBase(
    async () => {
      const [cards, checkins, achievements, existing] = await Promise.all([
        pb.collection('user_cards').getFullList<UserCard>({ filter: `user = "${userId}"` }),
        pb.collection('checkins').getFullList<Checkin>({ filter: `user = "${userId}"` }),
        pb.collection('achievements').getFullList<Achievement>({ filter: 'active = true' }),
        pb.collection('user_achievements').getFullList<UserAchievement>({ filter: `user = "${userId}"` }),
      ]);
      const alreadyUnlocked = new Set(existing.map((item) => item.achievement));
      const checks = getAchievementChecks(cards, checkins);
      const unlocked: UserAchievement[] = [];

      for (const achievement of achievements) {
        if (!checks[achievement.key] || alreadyUnlocked.has(achievement.id)) {
          continue;
        }

        const userAchievement = await pb.collection('user_achievements').create<UserAchievement>({
          user: userId,
          achievement: achievement.id,
          unlockedAt: new Date().toISOString(),
        });
        unlocked.push(userAchievement);
      }

      return unlocked;
    },
    () => [],
  );
}

function getAchievementChecks(cards: UserCard[], checkins: Checkin[]): Record<string, boolean> {
  return {
    first_match: cards.some((card) => card.type === 'match'),
    first_stadium_checkin: checkins.some((checkin) => checkin.type === 'stadium'),
    first_player_card: cards.some((card) => card.type === 'player'),
    first_bound_duplicate: cards.some((card) => card.bound),
    three_match_cards: cards.filter((card) => card.type === 'match').length >= 3,
  };
}
