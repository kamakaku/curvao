import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UnopenedPackageTile } from '../UnopenedPackageTile';

const mockPackage = {
  id: 'pkg-1',
  userId: 'u1',
  sourceType: 'live_watch' as const,
  status: 'unopened' as const,
  title: 'Test Package',
  rewardCount: 3,
  createdAt: new Date().toISOString(),
};

describe('UnopenedPackageTile', () => {
  it('renders correctly with package info', () => {
    const { getByText } = render(
      <UnopenedPackageTile 
        package={mockPackage} 
        count={1} 
        onPress={() => {}} 
      />
    );

    expect(getByText('Reward Package wartet')).toBeTruthy();
    expect(getByText('Earned. Not Bought.')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <UnopenedPackageTile 
        package={mockPackage} 
        count={1} 
        onPress={onPressMock} 
      />
    );

    fireEvent.press(getByText('ÖFFNEN'));

    expect(onPressMock).toHaveBeenCalled();
  });
});
