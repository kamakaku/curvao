import { getUserCards, isCardInActiveCollection } from '../cardService';
import { pb } from '../pocketbase';
import { mockStore } from '../mockStore';
import { UserCard } from '@/src/types/models';

// Mock pocketbase
jest.mock('../pocketbase', () => ({
  pb: {
    collection: jest.fn().mockReturnThis(),
    getFullList: jest.fn(),
  },
  tryPocketBase: jest.fn((op, fallback) => op().catch(fallback)),
}));

describe('cardService', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.userCards = [];
  });

  describe('getUserCards', () => {
    it('should return cards from PocketBase plus the developer demo card', async () => {
      const mockCards = [{ id: 'c1', user: userId, acquiredAt: '2023-01-01' }];
      (pb.collection as jest.Mock).mockReturnThis();
      (pb.collection('user_cards').getFullList as jest.Mock).mockResolvedValue(mockCards);

      const result = await getUserCards(userId);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('dev-demo-reese');
      expect(result[1]).toEqual(mockCards[0]);
    });

    it('should return only the developer demo card if PocketBase fails', async () => {
      const mockCard = { id: 'mc1', user: userId, acquiredAt: '2023-01-01' } as UserCard;
      
      (pb.collection as jest.Mock).mockReturnThis();
      (pb.collection('user_cards').getFullList as jest.Mock).mockRejectedValue(new Error('Fail'));

      const result = await getUserCards(userId);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('dev-demo-reese');
    });
  });

  describe('isCardInActiveCollection', () => {
    it('should return true for unbound and non-archived cards', () => {
      const card = { archived: false, boundTo: undefined } as any as UserCard;
      expect(isCardInActiveCollection(card)).toBe(true);
    });

    it('should return false for archived cards', () => {
      const card = { archived: true, boundTo: undefined } as any as UserCard;
      expect(isCardInActiveCollection(card)).toBe(false);
    });

    it('should return false for bound cards', () => {
      const card = { archived: false, boundTo: 'some-id' } as any as UserCard;
      expect(isCardInActiveCollection(card)).toBe(false);
    });
  });
});
