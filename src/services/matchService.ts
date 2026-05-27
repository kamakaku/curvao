import { mockStore } from '@/src/services/mockStore';
import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { Club, Match, MatchPlayer, Player, Stadium } from '@/src/types/models';

const clubCache = new Map<string, Club>();

export async function getClubs(): Promise<Club[]> {
  return tryPocketBase(
    async () => {
      const clubs = await pb.collection('clubs').getFullList<Club>({ sort: 'name' });
      cacheClubs(clubs);
      return clubs;
    },
    () => {
      cacheClubs(mockStore.clubs);
      return mockStore.clubs;
    },
  );
}

export async function getPlayers(): Promise<Player[]> {
  return tryPocketBase(
    async () => pb.collection('players').getFullList<Player>({ sort: 'displayName' }),
    () => mockStore.players,
  );
}

export async function getStadiums(): Promise<Stadium[]> {
  return tryPocketBase(
    async () => pb.collection('stadiums').getFullList<Stadium>({ expand: 'club', sort: 'sortOrder,name' }),
    () => mockStore.stadiums,
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
      return matches;
    },
    () => {
      hydrateMatchClubs(mockStore.matches);
      return mockStore.matches;
    },
  );
}

export async function getMatchPlayers(matchId: string): Promise<MatchPlayer[]> {
  return tryPocketBase(
    async () => pb.collection('match_players').getFullList<MatchPlayer>({ filter: `match = "${matchId}"` }),
    () => mockStore.matchPlayers.filter((matchPlayer) => matchPlayer.match === matchId),
  );
}

export async function getMatchById(matchId: string): Promise<Match | undefined> {
  return tryPocketBase(
    async () => {
      const match = await pb.collection('matches').getOne<Match>(matchId, {
        expand: 'homeClub,awayClub,stadium,stadium.club',
      });
      hydrateMatchClubs([match]);
      return match;
    },
    () => {
      const match = mockStore.matches.find((record) => record.id === matchId);
      if (match) hydrateMatchClubs([match]);
      return match;
    },
  );
}

export function getClubName(club?: string | Club) {
  if (!club) return 'Unknown Club';
  if (typeof club === 'object') {
    cacheClub(club);
    return club.name ?? 'Unknown Club';
  }

  return clubCache.get(club)?.name ?? mockStore.clubs.find((record) => record.id === club)?.name ?? 'Unknown Club';
}

export function getPlayerName(playerId?: string) {
  return mockStore.players.find((player) => player.id === playerId)?.displayName ?? 'Unknown Player';
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
