import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  Link: ({ children }: any) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Suppress known warnings in tests
console.warn = jest.fn();

// Mock PocketBase globally to avoid ESM issues in tests
jest.mock('pocketbase', () => {
  return jest.fn().mockImplementation(() => ({
    authStore: {
      isValid: false,
      token: '',
      model: null,
      clear: jest.fn(),
      save: jest.fn(),
      onChange: jest.fn(() => jest.fn()),
    },
    collection: jest.fn().mockReturnThis(),
    getFullList: jest.fn().mockResolvedValue([]),
    getList: jest.fn().mockResolvedValue({ items: [] }),
    getOne: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    files: {
      getURL: jest.fn(),
    },
    autoCancellation: jest.fn(),
  }));
});
