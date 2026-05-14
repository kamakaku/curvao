import { mockStore } from '@/src/services/mockStore';
import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { Club, Match, MatchPlayer, Player } from '@/src/types/models';

export async function getClubs(): Promise<Club[]> {
  return tryPocketBase(
    async () => pb.collection('clubs').getFullList<Club>({ sort: 'name' }),
    () => mockStore.clubs,
  );
}

export async function getPlayers(): Promise<Player[]> {
  return tryPocketBase(
    async () => pb.collection('players').getFullList<Player>({ sort: 'displayName' }),
    () => mockStore.players,
  );
}

export async function getMatches(): Promise<Match[]> {
  return tryPocketBase(
    async () => pb.collection('matches').getFullList<Match>({ sort: 'kickoffAt' }),
    () => mockStore.matches,
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
    async () => pb.collection('matches').getOne<Match>(matchId),
    () => mockStore.matches.find((match) => match.id === matchId),
  );
}

export function getClubName(clubId?: string) {
  return mockStore.clubs.find((club) => club.id === clubId)?.name ?? 'Unknown Club';
}

export function getPlayerName(playerId?: string) {
  return mockStore.players.find((player) => player.id === playerId)?.displayName ?? 'Unknown Player';
}
