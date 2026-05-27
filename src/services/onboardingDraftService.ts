export type OnboardingDraft = {
  favoriteClubId?: string;
  favoriteClubName?: string;
  preferredEarnMethods: string[];
  onboardingGoal?: string;
  selectedStarterPath?: string;
  createdAt: string;
};

const STORAGE_KEY = 'curvao:onboardingDraft';
const COMPLETED_STORAGE_PREFIX = 'curvao:onboardingCompleted:';

let memoryDraft: OnboardingDraft | null = null;
const memoryCompletedUserIds = new Set<string>();

export async function getOnboardingDraft(): Promise<OnboardingDraft | null> {
  const storedDraft = readStoredDraft();
  memoryDraft = storedDraft ?? memoryDraft;
  return memoryDraft;
}

export async function saveOnboardingDraft(draft: Partial<OnboardingDraft>): Promise<void> {
  const nextDraft: OnboardingDraft = {
    preferredEarnMethods: draft.preferredEarnMethods ?? [],
    createdAt: draft.createdAt ?? new Date().toISOString(),
    ...draft,
  };

  memoryDraft = nextDraft;
  writeStoredDraft(nextDraft);
}

export async function updateOnboardingDraft(partial: Partial<OnboardingDraft>): Promise<void> {
  const currentDraft = await getOnboardingDraft();
  await saveOnboardingDraft({
    ...currentDraft,
    ...partial,
    preferredEarnMethods: partial.preferredEarnMethods ?? currentDraft?.preferredEarnMethods ?? [],
    createdAt: currentDraft?.createdAt ?? partial.createdAt ?? new Date().toISOString(),
  });
}

export async function clearOnboardingDraft(): Promise<void> {
  memoryDraft = null;
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.removeItem(STORAGE_KEY);
  }
}

function readStoredDraft() {
  if (typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  try {
    const rawDraft = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!rawDraft) {
      return null;
    }

    const parsed = JSON.parse(rawDraft) as OnboardingDraft;
    return {
      ...parsed,
      preferredEarnMethods: Array.isArray(parsed.preferredEarnMethods) ? parsed.preferredEarnMethods : [],
    };
  } catch {
    return null;
  }
}

function writeStoredDraft(draft: OnboardingDraft) {
  if (typeof globalThis.localStorage === 'undefined') {
    // TODO: Persist onboarding draft on native with AsyncStorage if the dependency is added.
    return;
  }

  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function isOnboardingCompletedLocally(userId?: string) {
  if (!userId) {
    return false;
  }

  if (memoryCompletedUserIds.has(userId)) {
    return true;
  }

  if (typeof globalThis.localStorage === 'undefined') {
    return false;
  }

  return globalThis.localStorage.getItem(`${COMPLETED_STORAGE_PREFIX}${userId}`) === 'true';
}

export async function markOnboardingCompletedLocally(userId: string): Promise<void> {
  memoryCompletedUserIds.add(userId);
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.setItem(`${COMPLETED_STORAGE_PREFIX}${userId}`, 'true');
  }
}
