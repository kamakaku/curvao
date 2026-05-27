import { getClubName } from '@/src/services/matchService';
import type { Match } from '@/src/types/models';

export type MatchViewState = {
  status: 'upcoming' | 'live' | 'final' | 'archived';
  statusLabel: string;
  canLiveWatch: boolean;
  canStadiumCheckIn: boolean;
  countdownLabel?: string;
};

const LIVE_WATCH_WINDOW_BEFORE_MS = 15 * 60 * 1000;
const CHECKIN_WINDOW_BEFORE_MS = 2 * 60 * 60 * 1000;
const CHECKIN_WINDOW_AFTER_MS = 60 * 60 * 1000;
const ASSUMED_MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export function getMatchViewState(match?: Match): MatchViewState {
  if (!match) {
    return {
      status: 'archived',
      statusLabel: 'MATCHDAY',
      canLiveWatch: false,
      canStadiumCheckIn: false,
    };
  }

  const kickoffTime = new Date(match.kickoffAt).getTime();
  const now = Date.now();
  const liveWindowStart = kickoffTime - LIVE_WATCH_WINDOW_BEFORE_MS;
  const liveWindowEnd = kickoffTime + ASSUMED_MATCH_DURATION_MS - LIVE_WATCH_WINDOW_BEFORE_MS;
  const checkinWindowStart = kickoffTime - CHECKIN_WINDOW_BEFORE_MS;
  const checkinWindowEnd = kickoffTime + CHECKIN_WINDOW_AFTER_MS;

  if (match.status === 'live') {
    return {
      status: 'live',
      statusLabel: 'LIVE',
      canLiveWatch: true,
      canStadiumCheckIn: true,
      countdownLabel: 'LIVE',
    };
  }

  if (match.status === 'finished') {
    return {
      status: 'final',
      statusLabel: 'FINAL',
      canLiveWatch: false,
      canStadiumCheckIn: false,
    };
  }

  const canLiveWatch = __DEV__ || (now >= liveWindowStart && now <= liveWindowEnd);
  const canStadiumCheckIn = __DEV__ || (now >= checkinWindowStart && now <= checkinWindowEnd);

  return {
    status: now < kickoffTime ? 'upcoming' : 'archived',
    statusLabel: now < kickoffTime ? 'UPCOMING' : 'MATCHDAY',
    canLiveWatch,
    canStadiumCheckIn,
    countdownLabel: now < kickoffTime ? getCountdownToKickoff(match) : undefined,
  };
}

export function formatKickoffTime(match?: Match) {
  if (!match?.kickoffAt) return '—';
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(match.kickoffAt));
}

export function formatMatchDate(match?: Match) {
  if (!match?.kickoffAt) return '—';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short',
    year: 'numeric',
  }).format(new Date(match.kickoffAt)).replace(',', '');
}

export function formatKickoffDate(match?: Match) {
  if (!match?.kickoffAt) return '—';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(match.kickoffAt));
}

export function getCountdownToKickoff(match?: Match) {
  if (!match?.kickoffAt) return undefined;
  const parts = getCountdownParts(match);
  if (!parts) return undefined;
  return [parts.hours, parts.minutes, parts.seconds].join(' : ');
}

export function getCountdownParts(match?: Match) {
  if (!match?.kickoffAt) return undefined;
  const distanceSeconds = Math.max(0, Math.floor((new Date(match.kickoffAt).getTime() - Date.now()) / 1000));
  const hours = Math.floor(distanceSeconds / 3600);
  const minutes = Math.floor((distanceSeconds % 3600) / 60);
  const seconds = distanceSeconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function getTeamDisplay(match?: Match) {
  return {
    homeName: match?.expand?.homeClub?.name || getClubName(match?.homeClub),
    awayName: match?.expand?.awayClub?.name || getClubName(match?.awayClub),
    homeClubId: match?.homeClub,
    awayClubId: match?.awayClub,
    homeClub: match?.expand?.homeClub,
    awayClub: match?.expand?.awayClub,
  };
}

export function getMatchScoreLabel(match?: Match) {
  if (match?.homeScore === undefined || match.awayScore === undefined) return undefined;
  return `${match.homeScore} : ${match.awayScore}`;
}
