import { getUserSetProgress } from '@/src/services/cardSetService';
import { pb } from '@/src/services/pocketbase';
import type { RewardEvent } from '@/src/types/models';

export type SetCompletionResult = {
  granted: boolean;
  alreadyClaimed?: boolean;
  xpGranted?: number;
  message: string;
};

export async function canClaimSetCompletionReward(userId: string, setId: string): Promise<boolean> {
  const [progress, alreadyClaimed] = await Promise.all([
    getUserSetProgress({ userId, setId }),
    hasSetCompletionRewardEvent(userId, setId),
  ]);

  if (!progress?.set.completionReward) return false;
  if (!progress.completed) return false;
  if (alreadyClaimed) return false;

  return false;
}

export async function claimSetCompletionReward(input: {
  userId: string;
  setId: string;
}): Promise<SetCompletionResult> {
  const progress = await getUserSetProgress(input);
  if (!progress?.set.completionReward) {
    return {
      granted: false,
      message: 'Bonus bald verfügbar',
    };
  }

  const alreadyClaimed = await hasSetCompletionRewardEvent(input.userId, input.setId);
  if (alreadyClaimed) {
    return {
      granted: false,
      alreadyClaimed: true,
      message: 'Set-Bonus wurde bereits gesichert.',
    };
  }

  if (!progress.completed) {
    return {
      granted: false,
      message: 'Set ist noch nicht vollständig.',
    };
  }

  return {
    granted: false,
    message: 'Bonus bald verfügbar',
  };
}

async function hasSetCompletionRewardEvent(userId: string, setId: string) {
  try {
    const events = await pb.collection('reward_events').getFullList<RewardEvent>({
      filter: [
        `user = "${userId}"`,
        'actionType = "set_completion"',
        '(sourceType = "card_set" || sourceType = "set")',
        `sourceId = "${setId}"`,
        'status = "granted"',
      ].join(' && '),
    });
    return events.length > 0;
  } catch {
    return false;
  }
}
