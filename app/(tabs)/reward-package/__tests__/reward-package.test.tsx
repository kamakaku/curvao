import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import RewardPackageScreen from '../[id]';
import * as rewardPackageService from '@/src/services/rewardPackageService';
import * as authService from '@/src/services/authService';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock services
jest.mock('@/src/services/rewardPackageService');
jest.mock('@/src/services/authService');

describe('RewardPackageScreen', () => {
  const mockId = 'pkg-123';
  const mockUser = { id: 'u1' };
  const mockRouter = { replace: jest.fn(), back: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: mockId });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  it('shows loading state initially', () => {
    const { getByText } = render(<RewardPackageScreen />);
    expect(getByText('Wird geladen...')).toBeTruthy();
  });

  it('renders package info when loaded', async () => {
    (rewardPackageService.getRewardPackage as jest.Mock).mockResolvedValue({
      id: mockId,
      status: 'unopened',
      title: 'Stadium Reward',
      sourceType: 'stadium_checkin',
    });

    const { getByText, getAllByText } = render(<RewardPackageScreen />);
    
    await waitFor(() => {
      expect(getByText('PACKAGE ÖFFNEN')).toBeTruthy();
      expect(getAllByText(/Stadium Reward/i).length).toBeGreaterThan(0);
    });
  });

  it('handles the opening and revealing flow', async () => {
    const mockRewards = [
      { id: 'r1', type: 'xp', title: '+100 XP' },
      { id: 'r2', type: 'card', title: 'Epic Card', userCard: { id: 'c1', title: 'Epic Card', rarity: 'epic' } },
    ];

    (rewardPackageService.getRewardPackage as jest.Mock).mockResolvedValue({
      id: mockId,
      status: 'unopened',
      title: 'Stadium Reward',
      sourceType: 'stadium_checkin',
    });

    (rewardPackageService.openRewardPackage as jest.Mock).mockResolvedValue({
      package: { id: mockId, status: 'opened' },
      rewards: mockRewards,
    });

    const { getByText } = render(<RewardPackageScreen />);

    // Wait for load
    await waitFor(() => getByText('PACKAGE ÖFFNEN'));

    // Open package
    await act(async () => {
      fireEvent.press(getByText('PACKAGE ÖFFNEN'));
    });

    // Should show first reward (XP)
    await waitFor(() => {
      expect(getByText(/Reward 1 \/ 2/i)).toBeTruthy();
      expect(getByText('+100 XP')).toBeTruthy();
    });

    // Reveal next
    await act(async () => {
      fireEvent.press(getByText('NÄCHSTER REWARD'));
    });

    // Should show second reward (Card)
    await waitFor(() => {
      expect(getByText(/Reward 2 \/ 2/i)).toBeTruthy();
      expect(getByText('Epic Card')).toBeTruthy();
    });

    // Finalize
    await act(async () => {
      fireEvent.press(getByText('ERGEBNIS ANZEIGEN'));
    });

    // Should show results
    await waitFor(() => {
      expect(getByText('Deine Rewards')).toBeTruthy();
      expect(getByText('ZUR SAMMLUNG')).toBeTruthy();
    });
  });
});
