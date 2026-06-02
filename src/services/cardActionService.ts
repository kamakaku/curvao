import { Share } from 'react-native';
import { pb } from '@/src/services/pocketbase';
import type { UserCard } from '@/src/types/models';
import { formatRarity } from '@/src/services/cardTemplateService';

export type BondProgress = {
  level: number;
  currentXp: number;
  requiredXp: number;
  remainingXp: number;
  progress: number;
  canUpgrade: boolean;
  isMaxLevel: boolean;
};

const BOND_LEVEL_CURVE: Record<number, number> = {
  1: 250,
  2: 500,
  3: 900,
  4: 1400,
  5: 2100,
  6: 3000,
  7: 4200,
  8: 6000,
  9: 8500,
};

const MAX_BOND_LEVEL = 10;

export function getBondLevelRequirement(level: number): number {
  return BOND_LEVEL_CURVE[level] ?? 0;
}

export function getBondProgress(card: UserCard): BondProgress {
  const level = card.bondLevel ?? 1;
  const currentXp = card.bondXp ?? 0;
  const isMaxLevel = level >= MAX_BOND_LEVEL;
  const requiredXp = getBondLevelRequirement(level);
  const progress = isMaxLevel ? 1 : Math.min(1, currentXp / requiredXp);
  const canUpgrade = !isMaxLevel && currentXp >= requiredXp;
  const remainingXp = isMaxLevel ? 0 : Math.max(0, requiredXp - currentXp);

  return {
    level,
    currentXp,
    requiredXp,
    remainingXp,
    progress,
    canUpgrade,
    isMaxLevel,
  };
}

export async function shareCard(card: UserCard) {
  const rarity = formatRarity(card.rarity);
  const origin = card.origin.replace('_', ' ').toUpperCase();
  const edition = card.editionNumber ? `#${card.editionNumber} / ${card.editionSize ?? '?'}` : 'Open Edition';
  
  const shareText = `Meine CURVAO ${card.type === 'player' ? 'PlayerCard' : 'Card'}: ${card.title} · ${rarity} · ${origin} · Edition ${edition} · Earned. Not Bought.`;

  try {
    await Share.share({
      message: shareText,
    });
  } catch (error) {
    console.warn('Sharing failed', error);
  }
}

export async function toggleFavorite(card: UserCard): Promise<UserCard> {
  const nextValue = !card.favorite;
  return pb.collection('user_cards').update<UserCard>(card.id, { favorite: nextValue });
}

export async function upgradeCardBond(card: UserCard): Promise<UserCard> {
  const progress = getBondProgress(card);
  
  if (!progress.canUpgrade) {
    throw new Error('Nicht genug Verbindungs-XP für ein Upgrade.');
  }

  const nextLevel = card.bondLevel + 1;
  const remainingXp = card.bondXp - progress.requiredXp;

  return pb.collection('user_cards').update<UserCard>(card.id, {
    bondLevel: nextLevel,
    bondXp: remainingXp,
  });
}

export function getCardStatus(card: UserCard) {
  const status = [];
  if (card.archived) status.push('ARCHIVED');
  if (card.bound) status.push('BOUND');
  if (card.tradable) status.push('TRADABLE');
  return status.join(' · ');
}

export function copyCardIdToClipboard(card: UserCard) {
  // TODO: Implement using expo-clipboard when available
  console.log('Copy to clipboard:', card.id);
}