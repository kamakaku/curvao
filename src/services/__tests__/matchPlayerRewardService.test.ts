import { scoreMatchPlayerCardCandidate, selectStableWeightedCandidate } from '../matchPlayerRewardService';

describe('MatchPlayerRewardService', () => {
  describe('scoreMatchPlayerCardCandidate', () => {
    const baseCandidate = {
      playerId: 'p1',
      clubId: 'c1',
      cardTemplateId: 't1',
      cardTemplate: { id: 't1', type: 'player', name: 'Player 1' } as any,
    };

    it('boosts starter', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: { ...baseCandidate, started: true },
        userCards: [],
        source: 'live_watch'
      });
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons).toContain('Started');
    });

    it('boosts goal/assist', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: { ...baseCandidate, events: ['goal'] },
        userCards: [],
        source: 'live_watch'
      });
      expect(result.reasons).toContain('Goal/Assist');
      expect(result.boosts.eventBoost).toBe(true);
    });

    it('penalizes already owned cards', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: baseCandidate,
        userCards: [{ template: 't1' } as any],
        source: 'live_watch'
      });
      expect(result.score).toBeLessThan(0);
      expect(result.penalties).toContain('Already Owned');
      expect(result.boosts.notOwnedBoost).toBe(false);
    });

    it('boosts missing set slot', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: baseCandidate,
        userCards: [],
        setProgress: { slots: [{ slot: { slotType: 'player_card', playerId: 'p1' }, status: 'missing' }] } as any,
        source: 'live_watch'
      });
      expect(result.reasons).toContain('Missing in Set');
      expect(result.boosts.missingSetSlotBoost).toBe(true);
    });

    it('boosts wanted card', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: baseCandidate,
        userCards: [],
        wantedCards: [{ playerId: 'p1' } as any],
        source: 'live_watch'
      });
      expect(result.reasons).toContain('Wanted Card');
      expect(result.boosts.wantedSignal).toBe(true);
    });

    it('boosts favorite club', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: baseCandidate,
        userCards: [],
        favoriteClubId: 'c1',
        source: 'live_watch'
      });
      expect(result.reasons).toContain('Favorite Club');
      expect(result.boosts.favoriteClubBoost).toBe(true);
    });

    it('boosts strong performance scores', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: { ...baseCandidate, performanceScore: 86, formScore: 78, sportmonksRating: 7.4 },
        userCards: [],
        source: 'live_watch'
      });
      expect(result.boosts.performanceBoostApplied).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.performanceReasons).toContain('Performance 86');
    });

    it('missing performance does not crash', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: { ...baseCandidate, performanceScore: null, formScore: null, sportmonksRating: null },
        userCards: [],
        source: 'live_watch'
      });

      expect(typeof result.score).toBe('number');
      expect(result.boosts.performanceBoostApplied).toBe(false);
    });

    it('performance metadata appears in candidate score result', () => {
      const result = scoreMatchPlayerCardCandidate({
        candidate: { ...baseCandidate, performanceScore: 90, formScore: 81, sportmonksRating: 7.8 },
        userCards: [],
        source: 'live_watch'
      });

      expect(result.boosts.performanceBoostApplied).toBe(true);
      expect(result.performanceReasons).toEqual(expect.arrayContaining(['Performance 90', 'Form 81', 'Rating 7.8']));
    });
  });

  describe('selectStableWeightedCandidate', () => {
    it('returns stable candidate for same seed', () => {
      const candidates = [
        { score: 100, playerId: 'p1' },
        { score: 90, playerId: 'p2' },
        { score: 80, playerId: 'p3' },
      ] as any[];

      const c1 = selectStableWeightedCandidate({ candidates, seed: 'user1_match1' });
      const c2 = selectStableWeightedCandidate({ candidates, seed: 'user1_match1' });
      const c3 = selectStableWeightedCandidate({ candidates, seed: 'user2_match1' });

      expect(c1?.playerId).toBe(c2?.playerId);
      // It's possible c3 is the same, but hash should differ generally.
      // We just ensure stability here.
    });
  });
});
