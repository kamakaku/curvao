import { createCheckin, hasOtherActiveStadiumCheckin } from '../checkinService';
import * as matchService from '../matchService';
import { pb } from '../pocketbase';

// Mock matchService and pocketbase
jest.mock('../matchService');
jest.mock('../pocketbase', () => ({
  pb: {
    collection: jest.fn().mockReturnThis(),
    getFullList: jest.fn(),
    create: jest.fn(),
    autoCancellation: jest.fn(),
  },
  tryPocketBase: jest.fn((op) => op()),
}));

describe('checkinService', () => {
  const userId = 'user-1';
  const matchId = 'match-1';
  const otherMatchId = 'match-2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasOtherActiveStadiumCheckin', () => {
    it('should return true if user is checked in to another non-finished match', async () => {
      // Mock existing checkins
      (pb.collection as jest.Mock).mockReturnThis();
      (pb.collection('checkins').getFullList as jest.Mock).mockResolvedValue([
        { id: 'c1', user: userId, match: otherMatchId, type: 'stadium', status: 'verified' }
      ]);

      // Mock the other match as NOT finished
      (matchService.getMatchById as jest.Mock).mockResolvedValue({ id: otherMatchId, status: 'live' });

      const result = await hasOtherActiveStadiumCheckin(userId, matchId);
      expect(result).toBe(true);
    });

    it('should return false if other match is finished', async () => {
      (pb.collection as jest.Mock).mockReturnThis();
      (pb.collection('checkins').getFullList as jest.Mock).mockResolvedValue([
        { id: 'c1', user: userId, match: otherMatchId, type: 'stadium', status: 'verified' }
      ]);

      (matchService.getMatchById as jest.Mock).mockResolvedValue({ id: otherMatchId, status: 'finished' });

      const result = await hasOtherActiveStadiumCheckin(userId, matchId);
      expect(result).toBe(false);
    });
  });
});