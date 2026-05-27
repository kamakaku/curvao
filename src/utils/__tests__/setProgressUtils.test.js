const { matchUserCardToSlot, resolveSetProgress } = require('../setProgressUtils');

const baseSet = {
  id: 'set-1',
  key: 'set-1',
  type: 'matchday',
  title: 'Matchday Set',
  status: 'active',
};

function slot(overrides) {
  return {
    id: overrides.id || 'slot-1',
    setId: 'set-1',
    slotType: 'match_card',
    required: true,
    sortOrder: 1,
    ...overrides,
  };
}

function userCard(overrides) {
  return {
    id: overrides.id || 'card-1',
    user: 'user-1',
    type: 'match',
    title: 'Card',
    rarity: 'standard',
    origin: 'self_earned',
    tradable: false,
    bound: false,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 0,
    acquiredAt: new Date().toISOString(),
    archived: false,
    favorite: false,
    ...overrides,
  };
}

describe('setProgressUtils', () => {
  it('matches via cardTemplateId', () => {
    expect(matchUserCardToSlot(userCard({ template: 'tmpl-1' }), slot({ cardTemplateId: 'tmpl-1' }))).toBe(true);
  });

  it('matches via playerId', () => {
    expect(matchUserCardToSlot(userCard({ type: 'player', player: 'player-1' }), slot({ slotType: 'player_card', playerId: 'player-1' }))).toBe(true);
  });

  it('matches via matchId and sourceMatch fallback', () => {
    expect(matchUserCardToSlot(userCard({ type: 'moment', match: 'match-1' }), slot({ slotType: 'moment_card', matchId: 'match-1' }))).toBe(true);
    expect(matchUserCardToSlot(userCard({ type: 'moment', match: undefined, sourceMatch: 'match-2' }), slot({ slotType: 'moment_card', matchId: 'match-2' }))).toBe(true);
  });

  it('matches via stadiumId', () => {
    expect(matchUserCardToSlot(userCard({ type: 'stadium', stadium: 'stadium-1' }), slot({ slotType: 'stadium_card', stadiumId: 'stadium-1' }))).toBe(true);
  });

  it('counts only owned cards for progress', () => {
    const progress = resolveSetProgress({
      set: baseSet,
      slots: [slot({ id: 's1', matchId: 'match-1' }), slot({ id: 's2', slotType: 'player_card', playerId: 'player-1' })],
      userCards: [userCard({ id: 'c1', match: 'match-1' })],
    });

    expect(progress.totalSlots).toBe(2);
    expect(progress.ownedSlots).toBe(1);
    expect(progress.completed).toBe(false);
  });

  it('wanted does not count as owned', () => {
    const wantedCards = [{
      id: 'wanted-1',
      userId: 'user-1',
      targetType: 'match',
      matchId: 'match-1',
      setId: 'set-1',
      createdAt: new Date().toISOString(),
    }];

    const progress = resolveSetProgress({
      set: baseSet,
      slots: [slot({ matchId: 'match-1' })],
      userCards: [],
      wantedCards,
    });

    expect(progress.ownedSlots).toBe(0);
    expect(progress.slots[0].status).toBe('wanted');
  });

  it('locked does not count as owned', () => {
    const progress = resolveSetProgress({
      set: { ...baseSet, status: 'upcoming' },
      slots: [slot({ unlockState: 'locked_until_match' })],
      userCards: [],
    });

    expect(progress.ownedSlots).toBe(0);
    expect(progress.slots[0].status).toBe('locked');
  });

  it('reward pending does not count as owned', () => {
    const rewardPackages = [{
      id: 'pkg-1',
      userId: 'user-1',
      sourceType: 'live_watch',
      matchId: 'match-1',
      status: 'unopened',
      title: 'Reward',
      rewardCount: 1,
      createdAt: new Date().toISOString(),
    }];

    const progress = resolveSetProgress({
      set: baseSet,
      slots: [slot({ slotType: 'live_watch_reward', matchId: 'match-1' })],
      userCards: [],
      rewardPackages,
    });

    expect(progress.ownedSlots).toBe(0);
    expect(progress.slots[0].status).toBe('reward_pending');
  });

  it('completed is true only when all required slots are owned', () => {
    const progress = resolveSetProgress({
      set: baseSet,
      slots: [
        slot({ id: 's1', matchId: 'match-1' }),
        slot({ id: 's2', slotType: 'player_card', playerId: 'player-1' }),
      ],
      userCards: [
        userCard({ id: 'c1', match: 'match-1' }),
        userCard({ id: 'c2', type: 'player', player: 'player-1' }),
      ],
    });

    expect(progress.ownedRequiredSlots).toBe(2);
    expect(progress.completed).toBe(true);
  });
});
