import { getUserCards, isCardInActiveCollection } from '../cardService';
import { pb } from '../pocketbase';
import { UserCard } from '@/src/types/models';

// Mock pocketbase
jest.mock('../pocketbase', () => ({
  pb: {
    collection: jest.fn().mockReturnThis(),
    getFullList: jest.fn(),
  },
  tryPocketBase: jest.fn((op) => op()),
}));

describe('cardService', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCards', () => {
    it('should return cards from PocketBase', async () => {
      const mockCards = [{ id: 'c1', user: userId, acquiredAt: '2023-01-01' }];
      (pb.collection as jest.Mock).mockReturnThis();
      (pb.collection('user_cards').getFullList as jest.Mock).mockResolvedValue(mockCards);

      const result = await getUserCards(userId);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockCards[0]);
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