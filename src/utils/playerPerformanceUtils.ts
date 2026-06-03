export type PlayerMatchPerformanceLike = {
  rating?: number | null;
  minutesPlayed?: number | null;
  started?: boolean;
  substitutedIn?: boolean;
  goals?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  passes?: number;
  keyPasses?: number;
  tackles?: number;
  interceptions?: number;
  duelsWon?: number;
  saves?: number;
  cleanSheet?: boolean;
  yellowCards?: number;
  redCards?: number;
  performanceScore?: number | null;
  importedAt?: string;
  updated?: string;
  matchKickoffAt?: string;
  position?: string;
};

export type PlayerPerformanceBreakdown = {
  ratingScore: number;
  minutesScore: number;
  eventScore: number;
  roleScore: number;
  disciplinePenalty: number;
  total: number;
  reasons: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function normalizeSportmonksRating(rating?: number | null): number | null {
  const numeric = toNumber(rating);
  if (numeric === null) return null;
  if (numeric <= 0) return 0;
  if (numeric <= 10) return clamp(Math.round(numeric * 10));
  return clamp(Math.round(numeric));
}

export function calculatePlayerPerformanceBreakdown(
  performance: PlayerMatchPerformanceLike,
): PlayerPerformanceBreakdown {
  const reasons: string[] = [];
  const normalizedRating = normalizeSportmonksRating(performance.rating);
  const minutes = Math.max(0, Math.min(120, Math.round(toNumber(performance.minutesPlayed) ?? 0)));
  const goals = Math.max(0, Math.round(toNumber(performance.goals) ?? 0));
  const assists = Math.max(0, Math.round(toNumber(performance.assists) ?? 0));
  const saves = Math.max(0, Math.round(toNumber(performance.saves) ?? 0));
  const keyPasses = Math.max(0, Math.round(toNumber(performance.keyPasses) ?? 0));
  const tackles = Math.max(0, Math.round(toNumber(performance.tackles) ?? 0));
  const interceptions = Math.max(0, Math.round(toNumber(performance.interceptions) ?? 0));
  const duelsWon = Math.max(0, Math.round(toNumber(performance.duelsWon) ?? 0));
  const yellowCards = Math.max(0, Math.round(toNumber(performance.yellowCards) ?? 0));
  const redCards = Math.max(0, Math.round(toNumber(performance.redCards) ?? 0));

  const minutesScore = normalizedRating !== null
    ? Math.min(10, (minutes / 90) * 10)
    : Math.min(30, (minutes / 90) * 30);

  let eventScore = 0;
  if (goals > 0) {
    eventScore += goals * 20;
    reasons.push(`${goals} Tor(e)`);
  }
  if (assists > 0) {
    eventScore += assists * 15;
    reasons.push(`${assists} Assist(s)`);
  }

  let roleScore = 0;
  if (performance.started) {
    roleScore += 10;
    reasons.push('Startelf');
  } else if (performance.substitutedIn) {
    roleScore += 5;
    reasons.push('Eingewechselt');
  }

  const position = String(performance.position || '').toUpperCase();
  if (performance.cleanSheet && (position === 'GK' || position === 'DF')) {
    roleScore += 15;
    reasons.push('Zu Null');
  }
  if (saves > 0) {
    roleScore += Math.min(12, saves * 2);
    reasons.push(`${saves} Parade(n)`);
  }
  if (keyPasses > 0) {
    roleScore += Math.min(10, keyPasses * 2);
  }
  if (tackles > 0) {
    roleScore += Math.min(8, tackles * 1.5);
  }
  if (interceptions > 0) {
    roleScore += Math.min(8, interceptions * 1.5);
  }
  if (duelsWon > 0) {
    roleScore += Math.min(6, duelsWon * 1);
  }

  const disciplinePenalty = yellowCards * 5 + redCards * 20;
  if (yellowCards > 0) {
    reasons.push(`${yellowCards} Gelbe Karte(n)`);
  }
  if (redCards > 0) {
    reasons.push(`${redCards} Rote Karte(n)`);
  }

  let total = 0;
  let ratingScore = 0;
  if (normalizedRating !== null) {
    ratingScore = normalizedRating;
    total = normalizedRating
      + Math.min(12, eventScore * 0.3)
      + Math.min(10, roleScore * 0.35)
      + Math.min(6, minutesScore)
      - disciplinePenalty;
    reasons.unshift(`Rating ${normalizedRating}/100`);
  } else {
    total = minutesScore + eventScore + roleScore - disciplinePenalty;
  }

  return {
    ratingScore,
    minutesScore: Math.round(minutesScore),
    eventScore: Math.round(eventScore),
    roleScore: Math.round(roleScore),
    disciplinePenalty: Math.round(disciplinePenalty),
    total: clamp(Math.round(total)),
    reasons,
  };
}

export function calculateCurvaoPerformanceScore(performance: PlayerMatchPerformanceLike): number {
  return calculatePlayerPerformanceBreakdown(performance).total;
}

function getPerformanceTimestamp(performance: PlayerMatchPerformanceLike, fallbackIndex: number) {
  const value = performance.matchKickoffAt || performance.importedAt || performance.updated;
  if (!value) return Number.MAX_SAFE_INTEGER - fallbackIndex;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? -parsed : Number.MAX_SAFE_INTEGER - fallbackIndex;
}

export function calculateCurvaoFormScore(input: {
  recentPerformances: PlayerMatchPerformanceLike[];
  window?: number;
}): number {
  const window = input.window ?? 5;
  const performances = [...input.recentPerformances]
    .sort((left, right) => getPerformanceTimestamp(left, 0) - getPerformanceTimestamp(right, 1))
    .slice(0, window);

  if (performances.length === 0) return 0;

  const weights = performances.map((_, index) => Math.max(1, window - index));
  let weightedTotal = 0;
  let totalWeight = 0;

  performances.forEach((performance, index) => {
    const score = performance.performanceScore ?? calculateCurvaoPerformanceScore(performance);
    const weight = weights[index];
    weightedTotal += score * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) {
    const currentScore = performances[0]?.performanceScore ?? calculateCurvaoPerformanceScore(performances[0]);
    return clamp(Math.round(currentScore));
  }

  return clamp(Math.round(weightedTotal / totalWeight));
}

