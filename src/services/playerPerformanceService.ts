import { pb, tryPocketBase } from '@/src/services/pocketbase';
import type { PlayerMatchPerformance } from '@/src/types/models';
import { calculateCurvaoFormScore } from '@/src/utils/playerPerformanceUtils';

const COLLECTION = 'player_match_performances';

function sortPerformances(performances: PlayerMatchPerformance[]) {
  return [...performances].sort((left, right) => {
    const leftTime = new Date(left.expand?.match?.kickoffAt || left.importedAt || left.updated || 0).getTime();
    const rightTime = new Date(right.expand?.match?.kickoffAt || right.importedAt || right.updated || 0).getTime();
    return rightTime - leftTime;
  });
}

export async function getPlayerMatchPerformancesByMatch(matchId: string): Promise<PlayerMatchPerformance[]> {
  return tryPocketBase(
    async () => {
      const items = await pb.collection(COLLECTION).getFullList<PlayerMatchPerformance>({
        filter: `match = "${matchId}"`,
        expand: 'match,player,club',
      });
      return sortPerformances(items);
    },
    () => [],
  );
}

export async function getPlayerMatchPerformancesByPlayer(playerId: string): Promise<PlayerMatchPerformance[]> {
  return tryPocketBase(
    async () => {
      const items = await pb.collection(COLLECTION).getFullList<PlayerMatchPerformance>({
        filter: `player = "${playerId}"`,
        expand: 'match,player,club',
      });
      return sortPerformances(items);
    },
    () => [],
  );
}

export async function getLatestPlayerPerformance(playerId?: string): Promise<PlayerMatchPerformance | null> {
  if (!playerId) return null;
  const performances = await getPlayerMatchPerformancesByPlayer(playerId);
  return performances[0] ?? null;
}

export async function getPlayerFormForClash(playerId: string): Promise<number | null> {
  const performances = await getPlayerMatchPerformancesByPlayer(playerId);
  if (performances.length === 0) return null;
  return calculateCurvaoFormScore({ recentPerformances: performances, window: 5 });
}

export async function getPerformanceScoreForFanFive(playerId: string, matchId: string): Promise<number | null> {
  const performances = await getPlayerMatchPerformancesByMatch(matchId);
  const performance = performances.find((entry) => entry.player === playerId);
  return performance?.performanceScore ?? performance?.curvaoScore ?? null;
}

