import { createRewardPackage, type RewardPackage } from '@/src/services/rewardPackageService';
import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { Checkin, CheckinType, UserCard } from '@/src/types/models';

export async function getUserCheckins(userId: string): Promise<Checkin[]> {
  return tryPocketBase(
    async () => pb.collection('checkins').getFullList<Checkin>({ filter: `user = "${userId}"`, sort: '-verifiedAt' }),
    () => [],
  );
}

export async function hasOtherActiveStadiumCheckin(userId: string, currentMatchId?: string): Promise<boolean> {
  const checkins = await getUserCheckins(userId);

  return checkins.some(
    (checkin) =>
      checkin.type === 'stadium' &&
      checkin.status === 'verified' &&
      checkin.match !== currentMatchId,
  );
}

export async function createCheckin(userId: string, matchId: string, type: CheckinType): Promise<{ checkin: Checkin; rewardPackage?: RewardPackage }> {
  const payload: Omit<Checkin, 'id'> = {
    user: userId,
    match: matchId,
    type,
    status: 'verified',
    verifiedAt: new Date().toISOString(),
  };

  return tryPocketBase(
    async () => {
      const checkin = await pb.collection('checkins').create<Checkin>(payload);
      let rewardPackage: RewardPackage | undefined;
      
      if (type === 'stadium') {
        rewardPackage = await createRewardPackage({
            userId,
            source: 'stadium_checkin',
            sourceId: checkin.id,
            matchId,
        });
      }
      
      return { checkin, rewardPackage };
    },
    async () => { throw new Error('Create checkin failed'); },
  );
}
