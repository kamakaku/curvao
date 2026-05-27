import { pb } from '@/src/services/pocketbase';
import { markOnboardingCompletedLocally, type OnboardingDraft } from '@/src/services/onboardingDraftService';

type StarterRewardResult = {
  created: boolean;
  route?: string;
  reason?: string;
};

export async function applyOnboardingDraftToUser(userId: string, draft: OnboardingDraft): Promise<void> {
  const payload = {
    onboardingCompleted: true,
    onboardingCompletedAt: new Date().toISOString(),
    favoriteClubId: draft.favoriteClubId,
    favoriteClub: draft.favoriteClubId,
    preferredEarnMethods: JSON.stringify(draft.preferredEarnMethods ?? []),
    onboardingGoal: draft.onboardingGoal,
    selectedStarterPath: draft.selectedStarterPath,
  };

  try {
    await pb.collection('users').update(userId, removeUndefined(payload));
    await markOnboardingCompletedLocally(userId);
  } catch (error) {
    throw new Error(
      'Onboarding konnte nicht gespeichert werden. Prüfe die PocketBase-Felder für onboardingCompleted, favoriteClubId und preferredEarnMethods.',
      { cause: error },
    );
  }
}

export async function completeOnboardingForUser(input: {
  userId: string;
  draft: OnboardingDraft;
}): Promise<void> {
  await applyOnboardingDraftToUser(input.userId, input.draft);
}

export async function createStarterRewardIfAvailable(
  _userId: string,
  _draft: OnboardingDraft,
): Promise<StarterRewardResult> {
  // TODO: Connect this to a real packs/user_packs backend once available.
  return {
    created: false,
    reason: 'Starter-Pack Backend ist noch nicht verbunden.',
  };
}

function removeUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}
