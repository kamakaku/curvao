import { loginWithEmail, logout, getCurrentUser } from '../authService';
import { pb } from '../pocketbase';

// Mock pocketbase
jest.mock('../pocketbase', () => ({
  pb: {
    collection: jest.fn().mockReturnThis(),
    authWithPassword: jest.fn(),
    getOne: jest.fn(),
    authStore: {
      isValid: false,
      model: null,
      clear: jest.fn(),
      save: jest.fn(),
    },
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(pb.authStore, 'isValid', { value: false, writable: true });
    Object.defineProperty(pb.authStore, 'model', { value: null, writable: true });
  });

  describe('loginWithEmail', () => {
    it('should return record on successful PocketBase login', async () => {
      const mockRecord = { id: 'u1', email: 'test@test.com' };
      (pb.collection as jest.Mock).mockReturnValue({
        authWithPassword: jest.fn().mockResolvedValue({ record: mockRecord }),
      });

      const result = await loginWithEmail('test@test.com', 'password');
      expect(result).toEqual(mockRecord);
    });

    it('should fallback to mock user in DEV mode if PocketBase fails', async () => {
      // @ts-ignore - access global __DEV__
      global.__DEV__ = true;
      
      (pb.collection as jest.Mock).mockReturnValue({
        authWithPassword: jest.fn().mockRejectedValue(new Error('Connection failed')),
      });

      const result = await loginWithEmail('any@test.com', 'any');
      expect(result?.id).toBe('curvaodemouser1');
      expect(pb.authStore.save).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should throw AuthRequiredError if not valid and not mock user', async () => {
      Object.defineProperty(pb.authStore, 'isValid', { value: false, writable: true });
      await expect(getCurrentUser()).rejects.toThrow('Not authenticated');
    });

    it('should return user record if valid', async () => {
      const mockUser = { id: 'u1', email: 'test@test.com' };
      Object.defineProperty(pb.authStore, 'isValid', { value: true, writable: true });
      // @ts-ignore - mock internal authStore structure used in service
      pb.authStore.record = mockUser;
      
      (pb.collection as jest.Mock).mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await getCurrentUser();
      expect(result.id).toBe('u1');
    });
  });

  describe('logout', () => {
    it('should clear authStore', async () => {
      await logout();
      expect(pb.authStore.clear).toHaveBeenCalled();
    });
  });
});
