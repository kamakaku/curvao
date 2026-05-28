import { createLiveWatchRewardPackage, openRewardPackage } from '../rewardPackageService';
import * as rewardEngineService from '../rewardEngineService';
import * as matchService from '../matchService';
import { pb } from '../pocketbase';

// Mock dependencies
jest.mock('../rewardEngineService');
jest.mock('../matchService');
jest.mock('../pocketbase', () => ({
  pb: {
    collection: jest.fn().mockReturnThis(),
    create: jest.fn(),
    getOne: jest.fn(),
    getFullList: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
    autoCancellation: jest.fn(),
  },
}));

describe('rewardPackageService', () => {
  const userId = 'user-1';
  const matchId = 'match-1';
  const sessionId = 'session-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLiveWatchRewardPackage', () => {
    it('should create an unopened package if none exists', async () => {
      // Mock that no package exists
      (pb.collection as jest.Mock).mockReturnThis();
      (pb.collection('reward_packages').getFullList as jest.Mock).mockResolvedValue([]);
      
      // Mock no existing reward event
      (rewardEngineService.hasRewardEvent as jest.Mock).mockResolvedValue(false);
      
      // Mock match info
      (matchService.getMatchById as jest.Mock).mockResolvedValue({ id: matchId, homeClub: 'C1', awayClub: 'C2' });

      // Mock PB create
      (pb.collection('reward_packages').create as jest.Mock).mockImplementation((data) => ({ ...data, id: 'new-pkg-id' }));

      const result = await createLiveWatchRewardPackage({ userId, matchId, sessionId });

      expect(result.status).toBe('unopened');
      expect(result.sourceType).toBe('live_watch');
      expect(result.matchId).toBe(matchId);
      expect(pb.collection('reward_packages').create).toHaveBeenCalled();
    });
  });

  describe('openRewardPackage', () => {
    it('should transition status to opened and generate rewards', async () => {
      const packageId = 'pkg-1';
      const mockPackage = {
        id: packageId,
        user: userId,
        sourceType: 'live_watch',
        match: matchId,
        status: 'unopened',
        rewardCount: 3,
        metadata: JSON.stringify({ sessionId }),
      };

      const mockCollection = {
        getOne: jest.fn().mockResolvedValue(mockPackage),
        update: jest.fn().mockImplementation((id, data) => Promise.resolve({ ...mockPackage, ...data })),
        getFullList: jest.fn().mockResolvedValue([]),
      };

      (pb.collection as jest.Mock).mockImplementation((name) => {
        if (name === 'reward_packages' || name === 'users' || name === 'reward_events') return mockCollection;
        return { getOne: jest.fn(), update: jest.fn(), getFullList: jest.fn(), create: jest.fn() };
      });

      // Mock reward engine to return a template
      jest.spyOn(rewardEngineService, 'selectLiveWatchRewardCardTemplate').mockResolvedValue({ id: 'tmpl-1', type: 'match', name: 'Test' } as any);
      jest.spyOn(rewardEngineService, 'createRewardUserCardFromTemplate').mockResolvedValue({
        id: 'card-1',
        title: 'Reward Card',
        rarity: 'rare',
      } as any);

      // Mock user for XP increment
      mockCollection.getOne.mockImplementation((id) => {
        if (id === userId) return Promise.resolve({ id: userId, fanXp: 0 });
        return Promise.resolve(mockPackage);
      });

      const result = await openRewardPackage({ userId, packageId });

      expect(result.package.status).toBe('opened');
      expect(result.rewards.length).toBeGreaterThan(0);
      
      // Check for diverse rewards
      const types = result.rewards.map(r => r.type);
      expect(types).toContain('card');
      expect(types).toContain('xp');
      expect(types).toContain('bond_xp');
    });
  });
});