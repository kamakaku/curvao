import React from 'react';
import { render } from '@testing-library/react-native';
import { RarityBadge } from '../RarityBadge';

describe('RarityBadge', () => {
  it('renders standard rarity correctly', () => {
    const { getByText } = render(<RarityBadge rarity="standard" />);
    expect(getByText('STANDARD')).toBeTruthy();
  });

  it('renders legendary rarity correctly', () => {
    const { getByText } = render(<RarityBadge rarity="legendary" />);
    expect(getByText('LEGENDARY')).toBeTruthy();
  });
});
