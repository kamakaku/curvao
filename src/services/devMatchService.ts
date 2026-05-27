import { getUserCheckins } from '@/src/services/checkinService';
import { getActiveLiveWatchSession, completeLiveWatchSession } from '@/src/services/liveWatchService';
import { getMatches } from '@/src/services/matchService';
import { setLocalMatchStatusOverride } from '@/src/services/matchService';
import { pb } from '@/src/services/pocketbase';
import { createStadiumCheckinRewardPackage } from '@/src/services/rewardPackageService';

type FinishCurrentMatchResult = {
  matchId: string;
  rewardPackageIds: string[];
};

export async function finishCurrentCheckedInLiveMatch(userId: string): Promise<FinishCurrentMatchResult> {
  const checkins = await getUserCheckins(userId);
  const session = await getActiveLiveWatchSession(userId);
  const stadiumCheckin = session
    ? checkins.find(
        (checkin) => checkin.match === session.match && checkin.type === 'stadium' && checkin.status === 'verified',
      )
    : await getLatestOpenStadiumCheckin(userId, checkins);

  if (!stadiumCheckin) {
    throw new Error('Kein laufendes Match mit Stadium Check-in gefunden.');
  }

  await setMatchFinished(stadiumCheckin.match);
  const rewardPackageIds: string[] = [];

  if (!session || session.match !== stadiumCheckin.match) {
    const stadiumPackage = await createStadiumCheckinRewardPackage({
      userId,
      matchId: stadiumCheckin.match,
    });
    rewardPackageIds.push(stadiumPackage.id);
    return {
      matchId: stadiumCheckin.match,
      rewardPackageIds,
    };
  }

  const completion = await completeLiveWatchSession({
    sessionId: session.id,
    userId,
  });
  rewardPackageIds.push(completion.rewardPackage.id);
  const stadiumPackage = await createStadiumCheckinRewardPackage({
    userId,
    matchId: stadiumCheckin.match,
  });
  rewardPackageIds.push(stadiumPackage.id);

  return {
    matchId: stadiumCheckin.match,
    rewardPackageIds,
  };
}

async function setMatchFinished(matchId: string) {
  const now = new Date().toISOString();
  setLocalMatchStatusOverride(matchId, 'finished');

  try {
    await pb.collection('matches').update(matchId, {
      status: 'finished',
      updated: now,
    });
  } catch (error) {
    if (__DEV__) {
       console.warn('[PocketBase] Could not update match status on server, using local override', error);
    }
  }
}

async function getLatestOpenStadiumCheckin(userId: string, checkins: Awaited<ReturnType<typeof getUserCheckins>>) {
  const verifiedStadiumCheckins = checkins
    .filter((checkin) => checkin.user === userId && checkin.type === 'stadium' && checkin.status === 'verified')
    .sort((first, second) => (second.verifiedAt ?? '').localeCompare(first.verifiedAt ?? ''));

  if (verifiedStadiumCheckins.length === 0) return null;

  const matches = await getMatches();
  return (
    verifiedStadiumCheckins.find((checkin) => {
      const match = matches.find((item) => item.id === checkin.match);
      return match && match.status !== 'finished';
    }) ?? null
  );
}
