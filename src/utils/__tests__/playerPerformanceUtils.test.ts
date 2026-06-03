import {
  calculateCurvaoFormScore,
  calculateCurvaoPerformanceScore,
  normalizeSportmonksRating,
} from '../playerPerformanceUtils';

describe('playerPerformanceUtils', () => {
  it('normalizes rating 7.5 to 75', () => {
    expect(normalizeSportmonksRating(7.5)).toBe(75);
  });

  it('goal and assist increase score', () => {
    const low = calculateCurvaoPerformanceScore({ minutesPlayed: 90, started: true });
    const high = calculateCurvaoPerformanceScore({ minutesPlayed: 90, started: true, goals: 1, assists: 1 });
    expect(high).toBeGreaterThan(low);
  });

  it('yellow and red reduce score', () => {
    const clean = calculateCurvaoPerformanceScore({ minutesPlayed: 90, started: true, goals: 1 });
    const punished = calculateCurvaoPerformanceScore({ minutesPlayed: 90, started: true, goals: 1, yellowCards: 1, redCards: 1 });
    expect(punished).toBeLessThan(clean);
  });

  it('clamps score between 0 and 100', () => {
    expect(calculateCurvaoPerformanceScore({ rating: 10, goals: 5, assists: 5, minutesPlayed: 90, started: true })).toBeLessThanOrEqual(100);
    expect(calculateCurvaoPerformanceScore({ redCards: 5 })).toBeGreaterThanOrEqual(0);
  });

  it('calculates weighted form across last 5 performances', () => {
    const form = calculateCurvaoFormScore({
      recentPerformances: [
        { performanceScore: 90, importedAt: '2026-06-01T10:00:00.000Z' },
        { performanceScore: 80, importedAt: '2026-05-20T10:00:00.000Z' },
        { performanceScore: 70, importedAt: '2026-05-10T10:00:00.000Z' },
        { performanceScore: 60, importedAt: '2026-05-01T10:00:00.000Z' },
        { performanceScore: 50, importedAt: '2026-04-20T10:00:00.000Z' },
      ],
    });

    expect(form).toBeGreaterThan(70);
    expect(form).toBeLessThanOrEqual(100);
  });

  it('rating missing fallback score works', () => {
    const score = calculateCurvaoPerformanceScore({
      minutesPlayed: 90,
      started: true,
      goals: 1,
      rating: null,
    });

    expect(score).toBeGreaterThan(0);
  });

  it('form score with empty performances returns 0', () => {
    expect(calculateCurvaoFormScore({ recentPerformances: [] })).toBe(0);
  });
});
