import { getMatchById } from '@/src/services/matchService';
import { getUserCheckins, hasOtherActiveStadiumCheckin } from '@/src/services/checkinService';
import { pb } from '@/src/services/pocketbase';
import { hasRewardEvent } from '@/src/services/rewardEngineService';
import { createRewardPackage, getRewardPackageForMatch, type RewardPackage } from '@/src/services/rewardPackageService';
import type { LiveWatchSession, Match } from '@/src/types/models';

export const LIVE_WATCH_REQUIRED_SECONDS = __DEV__ ? 60 : 30 * 60;

const START_WINDOW_BEFORE_MS = 15 * 60 * 1000;
const END_WINDOW_AFTER_MS = 2 * 60 * 60 * 1000 - 15 * 60 * 1000;

export type LiveWatchAvailability = {
  canStart: boolean;
  canResume: boolean;
  canComplete: boolean;
  reason?: string;
  activeSession?: LiveWatchSession | null;
  completedSession?: LiveWatchSession | null;
  rewardPackage?: RewardPackage | null;
  alreadyRewarded: boolean;
  stadiumCheckedIn?: boolean;
  matchStatus?: 'upcoming' | 'live' | 'finished' | 'archived';
  otherActiveSession?: LiveWatchSession | null;
};

export type LiveWatchCompletionResult = {
  session: LiveWatchSession;
  rewardPackage: RewardPackage;
};

export async function getLiveWatchAvailability(input: {
  userId: string;
  matchId: string;
}): Promise<LiveWatchAvailability> {
  const [match, session, rewardPackage, alreadyRewarded, checkins, anyActiveSession, anyStadiumActive, anySessionForThisMatch] = await Promise.all([
    getMatchById(input.matchId),
    getLiveWatchSessionForMatch(input),
    getRewardPackageForMatch({ userId: input.userId, matchId: input.matchId, sourceType: 'live_watch' }).catch(() => null),
    hasRewardEvent(input.userId, 'live_watch', input.matchId).catch(() => false),
    getUserCheckins(input.userId).catch(() => []),
    getActiveLiveWatchSession(input.userId),
    hasOtherActiveStadiumCheckin(input.userId, input.matchId).catch(() => false),
    getAnyLiveWatchSessionForMatch(input),
  ]);
  const stadiumCheckedIn = checkins.some(
    (checkin) => checkin.match === input.matchId && checkin.type === 'stadium' && checkin.status === 'verified',
  );

  const activeSession = session?.status === 'active' ? session : null;
  const completedSession = session?.status === 'completed' ? session : null;
  const matchStatus = getMatchWindowStatus(match);
  
  const otherActiveSession = anyActiveSession?.match !== input.matchId ? anyActiveSession : null;

  if (activeSession) {
    return {
      canStart: false,
      canResume: true,
      canComplete: activeSession.watchedSeconds >= activeSession.requiredSeconds,
      activeSession,
      completedSession: null,
      rewardPackage,
      alreadyRewarded,
      stadiumCheckedIn,
      matchStatus,
      otherActiveSession,
    };
  }

  if (completedSession) {
    return {
      canStart: false,
      canResume: false,
      canComplete: !completedSession.rewardClaimed && completedSession.watchedSeconds >= completedSession.requiredSeconds,
      activeSession: null,
      completedSession,
      rewardPackage,
      alreadyRewarded,
      stadiumCheckedIn,
      matchStatus,
      reason: rewardPackage?.status === 'opened' || alreadyRewarded ? 'Reward wurde bereits gesichert.' : undefined,
      otherActiveSession,
    };
  }

  if (rewardPackage || alreadyRewarded) {
    return {
      canStart: false,
      canResume: false,
      canComplete: false,
      activeSession: null,
      completedSession: null,
      rewardPackage,
      alreadyRewarded,
      stadiumCheckedIn,
      matchStatus,
      reason: rewardPackage?.status === 'unopened' ? 'Reward Package wartet.' : 'Live Watch Reward wurde bereits gesichert.',
      otherActiveSession,
    };
  }

  if (anySessionForThisMatch?.status === 'cancelled' || anySessionForThisMatch?.status === 'expired') {
    return {
      canStart: false,
      canResume: false,
      canComplete: false,
      activeSession: null,
      completedSession: null,
      rewardPackage: null,
      alreadyRewarded: false,
      stadiumCheckedIn,
      matchStatus,
      reason: 'Live Watch wurde bereits gestartet.',
      otherActiveSession,
    };
  }

  if (anyStadiumActive) {
    return {
      canStart: false,
      canResume: false,
      canComplete: false,
      activeSession: null,
      completedSession: null,
      rewardPackage: null,
      alreadyRewarded: false,
      stadiumCheckedIn: true,
      matchStatus,
      reason: 'Du bist bereits in einem Stadion eingecheckt.',
      otherActiveSession,
    };
  }
  
  if (otherActiveSession) {
    return {
      canStart: false,
      canResume: false,
      canComplete: false,
      activeSession: null,
      completedSession: null,
      rewardPackage: null,
      alreadyRewarded,
      stadiumCheckedIn,
      matchStatus,
      reason: 'Live Watch läuft bereits für ein anderes Spiel.',
      otherActiveSession,
    };
  }

  const available = isMatchLiveWatchAvailable(match);

  return {
    canStart: available,
    canResume: false,
    canComplete: false,
    activeSession: null,
    completedSession: null,
    rewardPackage: null,
    alreadyRewarded,
    stadiumCheckedIn,
    matchStatus,
    reason: available ? undefined : 'Live Watch ist am Matchday verfügbar.',
    otherActiveSession,
  };
}

export async function startLiveWatchSession(input: {
  userId: string;
  matchId: string;
}): Promise<LiveWatchSession> {
  const existingSession = await getAnyLiveWatchSessionForMatch(input);
  if (existingSession?.status === 'cancelled' || existingSession?.status === 'expired') {
    throw new Error('Live Watch wurde für dieses Match bereits gestartet.');
  }

  const availability = await getLiveWatchAvailability(input);

  if (availability.activeSession) {
    return availability.activeSession;
  }

  if (availability.completedSession) {
    return availability.completedSession;
  }

  if (availability.alreadyRewarded || availability.rewardPackage) {
    throw new Error('Live Watch Reward wurde bereits vergeben.');
  }

  if (!availability.canStart) {
    if (availability.otherActiveSession) {
      throw new Error('active_session_exists');
    }
    throw new Error(availability.reason ?? 'Live Watch ist aktuell nicht verfügbar.');
  }

  const now = new Date().toISOString();

  return await pb.collection('live_watch_sessions').create<LiveWatchSession>({
    user: input.userId,
    match: input.matchId,
    status: 'active',
    startedAt: now,
    requiredSeconds: LIVE_WATCH_REQUIRED_SECONDS,
    watchedSeconds: 0,
    lastHeartbeatAt: now,
    checkpointCount: 0,
    rewardClaimed: false,
    metadata: JSON.stringify({ requiredSeconds: LIVE_WATCH_REQUIRED_SECONDS }),
  });
}

export async function heartbeatLiveWatchSession(input: {
  sessionId: string;
  userId: string;
}): Promise<LiveWatchSession> {
  const session = await pb.collection('live_watch_sessions').getOne<LiveWatchSession>(input.sessionId);
  assertOwnSession(session, input.userId);

  if (session.status !== 'active') {
    return session;
  }

  const now = new Date();
  const lastHeartbeatAt = session.lastHeartbeatAt ? new Date(session.lastHeartbeatAt) : new Date(session.startedAt);
  const elapsedSeconds = Math.max(1, Math.floor((now.getTime() - lastHeartbeatAt.getTime()) / 1000));
  const watchedSeconds = Math.min(session.requiredSeconds, (session.watchedSeconds || 0) + elapsedSeconds);

  return pb.collection('live_watch_sessions').update<LiveWatchSession>(session.id, {
    watchedSeconds,
    lastHeartbeatAt: now.toISOString(),
    checkpointCount: (session.checkpointCount ?? 0) + 1,
  });
}

export async function completeLiveWatchSession(input: {
  sessionId: string;
  userId: string;
}): Promise<LiveWatchCompletionResult> {
  const heartbeatSession = await heartbeatLiveWatchSession(input);
  assertOwnSession(heartbeatSession, input.userId);

  if (heartbeatSession.status === 'completed' && heartbeatSession.rewardClaimed) {
    const rewardPackage = await createRewardPackage({
      userId: input.userId,
      matchId: heartbeatSession.match,
      source: 'live_watch',
      sourceId: heartbeatSession.id,
    });
    return { session: heartbeatSession, rewardPackage };
  }

  if (heartbeatSession.status !== 'active') {
    throw new Error('Diese Live Watch Session ist nicht mehr aktiv.');
  }

  if (heartbeatSession.watchedSeconds < heartbeatSession.requiredSeconds && !__DEV__) {
    throw new Error('Mindestdauer noch nicht erreicht.');
  }

  const rewardPackage = await createRewardPackage({
    userId: input.userId,
    matchId: heartbeatSession.match,
    source: 'live_watch',
    sourceId: heartbeatSession.id,
  });

  const completedSession = await pb.collection('live_watch_sessions').update<LiveWatchSession>(heartbeatSession.id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    rewardClaimed: false,
  });

  return { session: completedSession, rewardPackage };
}

export async function cancelLiveWatchSession(input: {
  sessionId: string;
  userId: string;
}): Promise<void> {
  const session = await pb.collection('live_watch_sessions').getOne<LiveWatchSession>(input.sessionId);
  assertOwnSession(session, input.userId);

  if (session.status === 'active') {
    await pb.collection('live_watch_sessions').update(session.id, { status: 'cancelled' });
  }
}

export async function getLiveWatchSessionForMatch(input: {
  userId: string;
  matchId: string;
}): Promise<LiveWatchSession | null> {
  if (!input.userId || !input.matchId) return null;

  try {
    const sessions = await pb.collection('live_watch_sessions').getFullList<LiveWatchSession>({
      filter: `user = "${input.userId}" && match = "${input.matchId}" && (status = "active" || status = "completed")`,
      sort: '-startedAt',
    });

    return sessions[0] ?? null;
  } catch {
    return null;
  }
}

async function getAnyLiveWatchSessionForMatch(input: {
  userId: string;
  matchId: string;
}): Promise<LiveWatchSession | null> {
  try {
    const sessions = await pb.collection('live_watch_sessions').getFullList<LiveWatchSession>({
      filter: `user = "${input.userId}" && match = "${input.matchId}"`,
      sort: '-startedAt',
    });
    return sessions[0] ?? null;
  } catch {
    return null;
  }
}

export async function getActiveLiveWatchSession(userId: string): Promise<LiveWatchSession | null> {
  if (!userId) return null;

  try {
    const sessions = await pb.collection('live_watch_sessions').getFullList<LiveWatchSession>({
      filter: `user = "${userId}" && status = "active"`,
      sort: '-startedAt',
    });

    return sessions[0] ?? null;
  } catch {
    return null;
  }
}

function assertOwnSession(session: LiveWatchSession, userId: string) {
  if (session.user !== userId) {
    throw new Error('Diese Live Watch Session gehört nicht zum aktuellen User.');
  }
}

function isMatchLiveWatchAvailable(match?: Match) {
  if (!match) return false;
  if (__DEV__) return true;
  if (match.status === 'live') return true;
  if (match.status === 'finished') return false;

  const kickoff = new Date(match.kickoffAt).getTime();
  const now = Date.now();
  return now >= kickoff - START_WINDOW_BEFORE_MS && now <= kickoff + END_WINDOW_AFTER_MS;
}

function getMatchWindowStatus(match?: Match): LiveWatchAvailability['matchStatus'] {
  if (!match) return undefined;
  if (match.status === 'live') return 'live';
  if (match.status === 'finished') return 'finished';
  return new Date(match.kickoffAt).getTime() > Date.now() ? 'upcoming' : 'archived';
}

