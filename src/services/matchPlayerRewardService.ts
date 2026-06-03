import { getMatchPlayers, getMatchEvents } from '@/src/services/matchService';
import { getPlayerMatchPerformancesByMatch } from '@/src/services/playerPerformanceService';
import { getUserCards } from '@/src/services/cardService';
import { getWantedCards, type WantedCard } from '@/src/services/wantedCardService';
import { getMatchdaySetPreview } from '@/src/services/cardSetService';
import { pb } from '@/src/services/pocketbase';
import { type UserCard, type CardTemplate, type PlayerMatchPerformance } from '../types/models';
import { SetProgress } from '../utils/setProgressUtils';

export type MatchPlayerCandidate = {
  playerId: string;
  clubId?: string;
  teamSide?: 'home' | 'away';
  started?: boolean;
  substitutedIn?: boolean;
  playedMinutes?: number;
  events?: (
    | 'goal'
    | 'assist'
    | 'mvp'
    | 'clean_sheet'
    | 'save'
    | 'yellow_card'
    | 'red_card'
    | 'special_moment'
  )[];
  cardTemplateId?: string;
  cardTemplate?: CardTemplate;
  performanceScore?: number | null;
  formScore?: number | null;
  sportmonksRating?: number | null;
};

export type ScoredCandidate = MatchPlayerCandidate & {
  score: number;
  reasons?: string[];
  penalties?: string[];
  boosts?: any;
  performanceReasons?: string[];
};

/**
 * Deterministic hash function for stable selection.
 */
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Selects a stable candidate from a scored list using a seed.
 */
export function selectStableWeightedCandidate(input: {
  candidates: ScoredCandidate[];
  seed: string;
  maxCandidates?: number;
}): ScoredCandidate | null {
  const { candidates, seed, maxCandidates = 5 } = input;
  if (candidates.length === 0) return null;

  // 1. Sort by score descending
  const sorted = [...candidates].sort((a, b) => b.score - a.score);

  // 2. Take top N
  const topCandidates = sorted.slice(0, maxCandidates);

  // 3. Stable selection based on hash
  const hash = simpleHash(seed);
  const index = hash % topCandidates.length;

  return topCandidates[index];
}

/**
 * Fetches the reward pool of players who actually participated in the match.
 */
export type MatchPlayerRewardPoolInput = {
  matchId: string;
  includeStarters?: boolean;
  includeSubstitutes?: boolean;
  includeEventPlayers?: boolean;
};

export async function getMatchPlayerRewardPool(
  input: MatchPlayerRewardPoolInput | string,
): Promise<MatchPlayerCandidate[]> {
  const normalizedInput: MatchPlayerRewardPoolInput =
    typeof input === 'string' ? { matchId: input } : input;
  const { matchId } = normalizedInput;
  
  try {
    const [matchPlayers, matchEvents, matchPerformances, allTemplates] = await Promise.all([
      getMatchPlayers(matchId),
      getMatchEvents(matchId),
      getPlayerMatchPerformancesByMatch(matchId).catch(() => []),
      pb.collection('card_templates').getFullList<CardTemplate>({
          filter: 'active = true && type = "player"',
      })
    ]);

    const candidates: Map<string, MatchPlayerCandidate> = new Map();

    // 1. Process Match Players (Lineup)
    const performanceByPlayerId = new Map<string, PlayerMatchPerformance>();
    matchPerformances?.forEach((performance) => {
      performanceByPlayerId.set(performance.player, performance);
    });

    matchPlayers.forEach(mp => {
        const played = mp.started || (mp.minuteIn !== undefined && mp.minuteIn > 0);
        if (!played) return;

        const performance = performanceByPlayerId.get(mp.player);

        candidates.set(mp.player, {
            playerId: mp.player,
            clubId: mp.club,
            teamSide: mp.teamSide,
            started: mp.started,
            substitutedIn: mp.substitutedIn ?? (!mp.started && mp.minuteIn !== undefined),
            playedMinutes: performance?.minutesPlayed ?? mp.minutesPlayed ?? (mp.minuteOut ? (mp.minuteOut - (mp.minuteIn || 0)) : (mp.started ? 90 : 0)),
            events: [],
            performanceScore: performance?.performanceScore ?? performance?.curvaoScore ?? null,
            formScore: performance?.formScore ?? null,
            sportmonksRating: performance?.rating ?? null,
        });
    });

    // 2. Process Match Events
      matchEvents.forEach(event => {
        if (!event.player) return;
        
        let cand = candidates.get(event.player);
        if (!cand) {
            cand = {
                playerId: event.player,
                clubId: event.club,
                events: [],
            };
            candidates.set(event.player, cand);
        }

        if (event.eventType === 'goal' || event.eventType === 'penalty_goal') cand.events?.push('goal');
    });

    // 3. Attach Templates
    const templateByKey = new Map<string, CardTemplate>();
    allTemplates.forEach((template) => {
      if (template.key) templateByKey.set(template.key, template);
    });

    const pool: MatchPlayerCandidate[] = [];
    candidates.forEach(cand => {
        const template = templateByKey.get(`player_${cand.playerId}`);
        if (template) {
            cand.cardTemplateId = template.id;
            cand.cardTemplate = template;
            pool.push(cand);
        }
    });

    return pool;
  } catch (error) {
    console.error('[RewardPool] Failed to build match player pool', error);
    return [];
  }
}

/**
 * Scores a candidate based on performance and user context.
 */
export function scoreMatchPlayerCardCandidate(input: {
  candidate: MatchPlayerCandidate;
  userCards: UserCard[];
  wantedCards?: WantedCard[];
  setProgress?: SetProgress;
  favoriteClubId?: string;
  source: 'live_watch' | 'stadium_checkin' | 'fan_five';
}): { score: number, reasons: string[], penalties: string[], boosts: any, performanceReasons: string[] } {
  const { candidate, userCards, wantedCards, setProgress, favoriteClubId } = input;
  let score = 0;
  const reasons: string[] = [];
  const penalties: string[] = [];
  const boosts = {
    eventBoost: false,
    missingSetSlotBoost: false,
    wantedSignal: false,
    favoriteClubBoost: false,
    notOwnedBoost: false,
    performanceBoostApplied: false,
  };
  const performanceReasons: string[] = [];

  if (!candidate.cardTemplate) return { score: -1000, reasons, penalties, boosts, performanceReasons };

  // Performance Boosts
  if (candidate.events?.some((e: string) => e === 'special_moment' || e === 'mvp')) { score += 60; reasons.push('MVP/Special Moment'); boosts.eventBoost = true; }
  if (candidate.events?.some((e: string) => e === 'goal' || e === 'assist')) { score += 50; reasons.push('Goal/Assist'); boosts.eventBoost = true; }
  if (candidate.started) { score += 35; reasons.push('Started'); }
  if (candidate.substitutedIn) { score += 30; reasons.push('Substituted In'); }
  if ((candidate.playedMinutes || 0) >= 60) { score += 10; reasons.push('Played 60+ mins'); }
  if (candidate.events?.some((e: string) => e === 'clean_sheet' || e === 'save')) { score += 10; reasons.push('Clean Sheet/Save'); }

  if ((candidate.performanceScore ?? 0) >= 85) {
    score += 20;
    reasons.push('Top Performance');
    boosts.performanceBoostApplied = true;
    performanceReasons.push(`Performance ${candidate.performanceScore}`);
  } else if ((candidate.performanceScore ?? 0) >= 75) {
    score += 15;
    reasons.push('Starke Performance');
    boosts.performanceBoostApplied = true;
    performanceReasons.push(`Performance ${candidate.performanceScore}`);
  } else if ((candidate.performanceScore ?? 0) >= 65) {
    score += 10;
    reasons.push('Solide Performance');
    boosts.performanceBoostApplied = true;
    performanceReasons.push(`Performance ${candidate.performanceScore}`);
  }

  if ((candidate.formScore ?? 0) >= 75) {
    score += 10;
    reasons.push('Starke Form');
    boosts.performanceBoostApplied = true;
    performanceReasons.push(`Form ${candidate.formScore}`);
  }

  if ((candidate.sportmonksRating ?? 0) >= 7) {
    score += 5;
    reasons.push('Solide Note');
    boosts.performanceBoostApplied = true;
    performanceReasons.push(`Rating ${candidate.sportmonksRating}`);
  }

  // User Context Boosts
  const alreadyOwned = userCards.some(c => c.template === candidate.cardTemplateId);
  if (!alreadyOwned) { score += 25; reasons.push('Not Owned'); boosts.notOwnedBoost = true; }
  if (alreadyOwned) { score -= 80; penalties.push('Already Owned'); boosts.notOwnedBoost = false; }

  if (favoriteClubId && candidate.clubId === favoriteClubId) { score += 20; reasons.push('Favorite Club'); boosts.favoriteClubBoost = true; }

  // Set Progress Boost
  const isMissingInSet = setProgress?.slots.some(slot => 
    slot.slot.slotType === 'player_card' && 
    slot.slot.playerId === candidate.playerId && 
    slot.status === 'missing'
  );
  if (isMissingInSet) { score += 30; reasons.push('Missing in Set'); boosts.missingSetSlotBoost = true; }

  // Wanted Boost
  const isWanted = wantedCards?.some(w => 
    (w.playerId === candidate.playerId) || 
    (w.cardTemplateId === candidate.cardTemplateId)
  );
  if (isWanted) { score += 8; reasons.push('Wanted Card'); boosts.wantedSignal = true; }

  return { score, reasons, penalties, boosts, performanceReasons };
}

/**
 * High-level function to select personalized reward cards for a match.
 */
export async function selectPersonalizedRewardCards(input: {
    userId: string;
    matchId: string;
    source: 'live_watch' | 'stadium_checkin';
    packageId: string;
}): Promise<{ templates: CardTemplate[], metadata?: any }> {
    const { userId, matchId, source, packageId } = input;

    const [pool, userCards, wantedCards, setPreview, user] = await Promise.all([
        getMatchPlayerRewardPool({ matchId }),
        getUserCards(userId),
        getWantedCards(userId).catch(() => []),
        getMatchdaySetPreview({ userId, matchId }).catch(() => null),
        pb.collection('users').getOne(userId).catch(() => null),
    ]);

    const scored: ScoredCandidate[] = pool.map(cand => {
        const result = scoreMatchPlayerCardCandidate({
            candidate: cand,
            userCards,
            wantedCards,
            setProgress: setPreview?.progress,
            favoriteClubId: (user as any)?.favoriteClubId,
            source,
        });
        return {
            ...cand,
            score: result.score,
            reasons: result.reasons,
            penalties: result.penalties,
            boosts: result.boosts,
            performanceReasons: result.performanceReasons,
        };
    }).filter(c => c.score > -500);

    const seed = `${userId}_${matchId}_${source}_${packageId}`;
    const selected = selectStableWeightedCandidate({
        candidates: scored,
        seed,
    });

    const top5 = [...scored].sort((a, b) => b.score - a.score).slice(0, 5).map(c => ({
        playerId: c.playerId,
        templateId: c.cardTemplateId,
        score: c.score,
        reasons: c.reasons,
        penalties: c.penalties,
        performanceScore: c.performanceScore,
        formScore: c.formScore,
        sportmonksRating: c.sportmonksRating,
        performanceReasons: c.performanceReasons,
        performanceBoostApplied: c.boosts?.performanceBoostApplied ?? false,
    }));

    if (selected?.cardTemplate) {
        return {
            templates: [selected.cardTemplate],
            metadata: {
                selectedPlayerId: selected.playerId,
                selectedTemplateId: selected.cardTemplateId,
                performanceScore: selected.performanceScore,
                formScore: selected.formScore,
                sportmonksRating: selected.sportmonksRating,
                performanceBoostApplied: selected.boosts?.performanceBoostApplied ?? false,
                performanceReasons: selected.performanceReasons ?? [],
                selectionReason: 'Highest scored candidate based on performance and user context',
                source,
                matchId,
                packageId,
                matchPlayerPoolSize: pool.length,
                candidateScores: top5,
                fallbackUsed: false,
                eventBoostApplied: selected.boosts?.eventBoost,
                setSlotBoostApplied: selected.boosts?.missingSetSlotBoost,
                wantedSignalApplied: selected.boosts?.wantedSignal,
                favoriteClubBoostApplied: selected.boosts?.favoriteClubBoost,
                alreadyOwnedPenaltyApplied: !selected.boosts?.notOwnedBoost,
            }
        };
    }

    return { templates: [] };
}
