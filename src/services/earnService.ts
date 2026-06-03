import { getMatches } from '@/src/services/matchService';
import { getStarterPackAvailability } from '@/src/services/starterPackService';
import { getLiveWatchSessionForMatch } from '@/src/services/liveWatchService';
import { getUnopenedRewardPackages, type RewardPackage } from '@/src/services/rewardPackageService';
import type { CardType, LiveWatchSession, Match, UserCard } from '@/src/types/models';

export type EarnMatchLike = Match;

export type EarnAvailability = {
  currentMatch?: EarnMatchLike | null;
  upcomingMatch?: EarnMatchLike | null;
  canLiveWatch: boolean;
  canStadiumCheckIn: boolean;
  activeLiveWatchSession?: LiveWatchSession | null;
  unopenedRewardPackages: RewardPackage[];
  unopenedPackCount: number;
  canClaimCard: boolean;
};

export type ClaimableCardType = Extract<CardType, 'player' | 'match' | 'stadium' | 'club'>;

export type CreateFanClaimedCardInput = {
  userId: string;
  cardType: ClaimableCardType;
  templateId?: string;
  playerId?: string;
  matchId?: string;
  stadiumId?: string;
  clubId?: string;
};

export type ClaimableEarnItem = {
  id: string;
  cardType: ClaimableCardType;
  title: string;
  subtitle?: string;
  playerId?: string;
  matchId?: string;
  stadiumId?: string;
  clubId?: string;
};

const LIVE_WINDOW_BEFORE_MS = 60 * 60 * 1000;
const LIVE_WINDOW_AFTER_MS = 3 * 60 * 60 * 1000;
const STADIUM_CHECKIN_WINDOW_BEFORE_MS = 8 * 60 * 60 * 1000;
const STADIUM_CHECKIN_WINDOW_AFTER_MS = 6 * 60 * 60 * 1000;

function getTimeDistance(match: Match, now: Date) {
  return new Date(match.kickoffAt).getTime() - now.getTime();
}

function isLiveWatchAvailable(match: Match, now: Date) {
  const distance = getTimeDistance(match, now);
  return match.status === 'live' || (distance >= -LIVE_WINDOW_AFTER_MS && distance <= LIVE_WINDOW_BEFORE_MS);
}

function isStadiumCheckinAvailable(match: Match, now: Date) {
  if (__DEV__) return true;
  const distance = getTimeDistance(match, now);
  return match.status === 'live' || (distance >= -STADIUM_CHECKIN_WINDOW_AFTER_MS && distance <= STADIUM_CHECKIN_WINDOW_BEFORE_MS);
}

function sortByKickoff(matches: Match[]) {
  return [...matches].sort((first, second) => new Date(first.kickoffAt).getTime() - new Date(second.kickoffAt).getTime());
}

export async function getEarnAvailability(userId: string): Promise<EarnAvailability> {
  const matches = await getMatches();
  const now = new Date();
  const upcomingMatches = sortByKickoff(matches.filter((match) => new Date(match.kickoffAt).getTime() >= now.getTime()));
  const currentMatch = matches.find((match) => isLiveWatchAvailable(match, now)) ?? null;
  const upcomingMatch = upcomingMatches[0] ?? null;
  const availabilityMatch = currentMatch ?? upcomingMatch;
  const [starterPackAvailability, activeLiveWatchSession, unopenedRewardPackages] = await Promise.all([
    getStarterPackAvailability(userId).catch(() => null),
    availabilityMatch
      ? getLiveWatchSessionForMatch({ userId, matchId: availabilityMatch.id }).catch(() => null)
      : Promise.resolve(null),
    getUnopenedRewardPackages(userId).catch(() => []),
  ]);

  return {
    currentMatch,
    upcomingMatch,
    canLiveWatch: Boolean(availabilityMatch && isLiveWatchAvailable(availabilityMatch, now)),
    canStadiumCheckIn: Boolean(availabilityMatch && isStadiumCheckinAvailable(availabilityMatch, now)),
    activeLiveWatchSession,
    unopenedRewardPackages,
    unopenedPackCount: (starterPackAvailability?.unopenedPackCount ?? 0) + unopenedRewardPackages.length,
    canClaimCard: false,
  };
}

export async function getClaimableEarnItems(cardType: ClaimableCardType): Promise<ClaimableEarnItem[]> {
  void cardType;
  return [];
}

export async function createFanClaimedCard(input: CreateFanClaimedCardInput): Promise<UserCard> {
  void input;
  throw new Error('Direktes Claimen ist deaktiviert. Cards werden nur noch über Match-Aktionen und Reward Packages verdient.');
}
