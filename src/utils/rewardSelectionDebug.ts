export type RewardSelectionCandidateScore = {
  playerId?: string;
  templateId?: string;
  score: number;
  reasons?: string[];
  penalties?: string[];
};

export type RewardSelectionDebugInfo = {
  source?: string;
  matchId?: string;
  packageId?: string;
  selectedPlayerId?: string;
  selectedTemplateId?: string;
  selectionReason?: string;
  matchPlayerPoolSize?: number;
  fallbackUsed?: boolean;
  fallbackReason?: string;
  candidateScores?: RewardSelectionCandidateScore[];
  boosts?: {
    eventBoost?: boolean;
    missingSetSlotBoost?: boolean;
    wantedSignal?: boolean;
    favoriteClubBoost?: boolean;
    notOwnedBoost?: boolean;
  };
};

/**
 * Extracts and normalizes debug info from a reward event or package's metadata.
 * Tolerant to missing or malformed data.
 */
export function extractRewardSelectionDebugInfo(
  item: any
): RewardSelectionDebugInfo {
  const meta = item?.metadata || {};
  
  return {
    source: meta.source || undefined,
    matchId: meta.matchId || undefined,
    packageId: meta.packageId || undefined,
    selectedPlayerId: meta.selectedPlayerId || undefined,
    selectedTemplateId: meta.selectedTemplateId || undefined,
    selectionReason: meta.selectionReason || undefined,
    matchPlayerPoolSize:
      typeof meta.matchPlayerPoolSize === 'number'
        ? meta.matchPlayerPoolSize
        : undefined,
    fallbackUsed: !!meta.fallbackUsed,
    fallbackReason: meta.fallbackReason || undefined,
    candidateScores: Array.isArray(meta.candidateScores)
      ? meta.candidateScores
      : undefined,
    boosts: {
      eventBoost: !!meta.eventBoostApplied,
      missingSetSlotBoost: !!meta.setSlotBoostApplied,
      wantedSignal: !!meta.wantedSignalApplied,
      favoriteClubBoost: !!meta.favoriteClubBoostApplied,
      notOwnedBoost: meta.alreadyOwnedPenaltyApplied === false,
    },
  };
}

/**
 * Formats a single string summarizing the reason for selection,
 * useful for simple UI display.
 */
export function formatRewardSelectionReason(metadata: any): string {
  const info = extractRewardSelectionDebugInfo({ metadata });
  
  if (info.fallbackUsed) {
    return `Fallback used: ${info.fallbackReason || 'Unknown reason'}`;
  }
  
  if (info.selectionReason) {
    return info.selectionReason;
  }
  
  const boosts = [];
  if (info.boosts?.favoriteClubBoost) boosts.push('Favorite Club');
  if (info.boosts?.wantedSignal) boosts.push('Wanted Card');
  if (info.boosts?.missingSetSlotBoost) boosts.push('Missing Set Slot');
  if (info.boosts?.eventBoost) boosts.push('Event Boost');
  if (info.boosts?.notOwnedBoost) boosts.push('Not Owned');
  
  if (boosts.length > 0) {
    return `Boosts applied: ${boosts.join(', ')}`;
  }
  
  return 'Standard selection';
}
