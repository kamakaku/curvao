import { generateCardsForCheckin } from '@/src/services/cardService';
import { createId, mockStore } from '@/src/services/mockStore';
import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { Checkin, CheckinType, UserCard } from '@/src/types/models';

export async function getUserCheckins(userId: string): Promise<Checkin[]> {
  return tryPocketBase(
    async () => pb.collection('checkins').getFullList<Checkin>({ filter: `user = "${userId}"`, sort: '-verifiedAt' }),
    () => mockStore.checkins.filter((checkin) => checkin.user === userId),
  );
}

export async function createCheckin(userId: string, matchId: string, type: CheckinType): Promise<{ checkin: Checkin; cards: UserCard[] }> {
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
      const cards = await generateCardsForCheckin(userId, matchId, type, checkin.id);
      return { checkin, cards };
    },
    async () => {
      const checkin = { ...payload, id: createId('checkin') };
      mockStore.checkins.unshift(checkin);
      const cards = await generateCardsForCheckin(userId, matchId, type, checkin.id);
      return { checkin, cards };
    },
  );
}
