import { getLiveWatchAvailability } from '../liveWatchService';
import * as checkinService from '../checkinService';
import * as matchService from '../matchService';
import * as rewardPackageService from '../rewardPackageService';
import * as rewardEngineService from '../rewardEngineService';
import { pb } from '../pocketbase';

// Mock all services except liveWatchService itself (we are testing it)
jest.mock('../matchService');
jest.mock('../checkinService');
jest.mock('../rewardPackageService');
jest.mock('../rewardEngineService');
jest.mock('../pocketbase', () => ({
  pb: {
    collection: jest.fn().mockReturnThis(),
    getFullList: jest.fn(),
    getList: jest.fn().mockResolvedValue({ items: [] }),
    autoCancellation: jest.fn(),
  },
}));

describe('liveWatchService', () => {
  const userId = 'user-1';
  const matchId = 'match-1';
  const otherMatchId = 'match-2';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for getFullList
    (pb.collection as jest.Mock).mockReturnThis();
    (pb.collection('any').getFullList as jest.Mock).mockResolvedValue([]);
  });

  describe('getLiveWatchAvailability', () => {
    it('should block live watch if user has an active session for another match', async () => {
      // Mock match info
      (matchService.getMatchById as jest.Mock).mockResolvedValue({
        id: matchId,
        status: 'live',
        kickoffAt: new Date().toISOString(),
      });

      // Mock that there is an active session for ANOTHER match via PB
      (pb.collection as jest.Mock).mockImplementation((collectionName) => {
        return {
          getFullList: jest.fn().mockImplementation((options) => {
            if (collectionName === 'live_watch_sessions') {
              // If it's the check for any active session
              if (options.filter && options.filter.includes('status = "active"') && !options.filter.includes(matchId)) {
                return Promise.resolve([{
                  id: 'session-2',
                  user: userId,
                  match: otherMatchId,
                  status: 'active',
                  startedAt: new Date().toISOString(),
                  watchedSeconds: 10,
                  requiredSeconds: 60,
                  checkpointCount: 0,
                  rewardClaimed: false,
                }]);
              }
            }
            return Promise.resolve([]);
          }),
        };
      });

      // Mock other dependencies
      (rewardPackageService.getRewardPackageForMatch as jest.Mock).mockResolvedValue(null);
      (rewardEngineService.hasRewardEvent as jest.Mock).mockResolvedValue(false);
      (checkinService.getUserCheckins as jest.Mock).mockResolvedValue([]);
      (checkinService.hasOtherActiveStadiumCheckin as jest.Mock).mockResolvedValue(false);

      const result = await getLiveWatchAvailability({ userId, matchId });

      expect(result.canStart).toBe(false);
      expect(result.otherActiveSession).toBeDefined();
      expect(result.otherActiveSession?.match).toBe(otherMatchId);
      expect(result.reason).toBe('Live Watch läuft bereits für ein anderes Spiel.');
    });

    it('should allow live watch if no other active session exists', async () => {
      (matchService.getMatchById as jest.Mock).mockResolvedValue({
        id: matchId,
        status: 'live',
        kickoffAt: new Date().toISOString(),
      });

      (pb.collection('any').getFullList as jest.Mock).mockResolvedValue([]);
      (rewardPackageService.getRewardPackageForMatch as jest.Mock).mockResolvedValue(null);
      (rewardEngineService.hasRewardEvent as jest.Mock).mockResolvedValue(false);
      (checkinService.getUserCheckins as jest.Mock).mockResolvedValue([]);
      (checkinService.hasOtherActiveStadiumCheckin as jest.Mock).mockResolvedValue(false);

      const result = await getLiveWatchAvailability({ userId, matchId });

      expect(result.canStart).toBe(true);
      expect(result.otherActiveSession).toBeNull();
    });
  });
});