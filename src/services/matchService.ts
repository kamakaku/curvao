import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { Club, Match, MatchEvent, MatchPlayer, Player, Stadium } from '@/src/types/models';

const clubCache = new Map<string, Club>();

export async function getClubs(): Promise<Club[]> {
  return tryPocketBase(
    async () => {
      const clubs = await pb.collection('clubs').getFullList<Club>({ sort: 'name' });
      cacheClubs(clubs);
      return clubs;
    },
    () => [],
  );
}

export async function getPlayers(): Promise<Player[]> {
  return tryPocketBase(
    async () => pb.collection('players').getFullList<Player>({ sort: 'displayName' }),
    () => [],
  );
}

export async function getStadiums(): Promise<Stadium[]> {
  return tryPocketBase(
    async () => pb.collection('stadiums').getFullList<Stadium>({ expand: 'club', sort: 'name' }),
    () => [],
  );
}

export async function getMatches(): Promise<Match[]> {
  return tryPocketBase(
    async () => {
      const matches = await pb.collection('matches').getFullList<Match>({
        expand: 'homeClub,awayClub,stadium,stadium.club',
        sort: 'kickoffAt',
      });
      hydrateMatchClubs(matches);
      return matches.map(applyLocalMatchOverride).filter(Boolean) as Match[];
    },
    () => [],
  );
}

export async function getMatchPlayers(matchId: string): Promise<MatchPlayer[]> {
  return tryPocketBase(
    async () => pb.collection('match_players').getFullList<MatchPlayer>({ filter: `match = "${matchId}"` }),
    () => [],
  );
}

export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  return tryPocketBase(
    async () => {
      const events = await pb.collection('match_events').getFullList<MatchEvent>({
        filter: `match = "${matchId}"`,
        expand: 'club,player,relatedPlayer',
      });
      return events.sort((left, right) => {
        const leftMinute = left.minute ?? 999;
        const rightMinute = right.minute ?? 999;
        if (leftMinute !== rightMinute) {
          return leftMinute - rightMinute;
        }
        return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
      });
    },
    () => [],
  );
}

export async function getMatchById(matchId: string): Promise<Match | undefined> {
  return tryPocketBase(
    async () => {
      const match = await pb.collection('matches').getOne<Match>(matchId, {
        expand: 'homeClub,awayClub,stadium,stadium.club',
      });
      hydrateMatchClubs([match]);
      return applyLocalMatchOverride(match);
    },
    () => undefined,
  );
}

export function setLocalMatchStatusOverride(matchId: string, status: Match['status']) {
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.setItem(`${LOCAL_MATCH_STATUS_PREFIX}${matchId}`, status);
  }
}

export function clearLocalMatchStatusOverrides() {
  if (typeof globalThis.localStorage === 'undefined') return 0;

  const keysToDelete: string[] = [];
  for (let index = 0; index < globalThis.localStorage.length; index += 1) {
    const key = globalThis.localStorage.key(index);
    if (key?.startsWith(LOCAL_MATCH_STATUS_PREFIX)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => globalThis.localStorage.removeItem(key));
  return keysToDelete.length;
}

const LOCAL_MATCH_STATUS_PREFIX = 'curvao.dev.matchStatus.';

function applyLocalMatchOverride(match?: Match) {
  if (!match) return match;
  const localStatus = getLocalMatchStatusOverride(match.id);
  return localStatus ? { ...match, status: localStatus } : match;
}

function getLocalMatchStatusOverride(matchId: string): Match['status'] | undefined {
  if (typeof globalThis.localStorage === 'undefined') return undefined;
  const value = globalThis.localStorage.getItem(`${LOCAL_MATCH_STATUS_PREFIX}${matchId}`);
  if (value === 'scheduled' || value === 'live' || value === 'finished') {
    return value;
  }
  return undefined;
}

export function getClubName(club?: string | Club) {
  if (!club) return 'Unknown Club';
  if (typeof club === 'object') {
    cacheClub(club);
    return club.name ?? 'Unknown Club';
  }

  return clubCache.get(club)?.name ?? 'Unknown Club';
}

export function getPlayerName(playerId?: string) {
  return 'Unknown Player';
}

function cacheClub(club?: Club) {
  if (!club?.id) return;
  clubCache.set(club.id, club);
}

function cacheClubs(clubs: Club[]) {
  clubs.forEach(cacheClub);
}

function hydrateMatchClubs(matches: Match[]) {
  matches.forEach((match) => {
    cacheClub(match.expand?.homeClub);
    cacheClub(match.expand?.awayClub);
    cacheClub(match.expand?.stadium?.expand?.club);
  });
}
