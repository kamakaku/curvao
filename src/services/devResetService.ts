import { clearLocalMatchStatusOverrides } from '@/src/services/matchService';
import { pb } from '@/src/services/pocketbase';

const LOCAL_STORAGE_PREFIXES = [
  'curvao.liveWatchSession.',
  'curvao.rewardPackage.',
];

type ResetResult = {
  deletedRemoteRecords: number;
  deletedLocalRecords: number;
};

const RESET_COLLECTION_ORDER = [
  'reward_packages',
  'reward_events',
  'live_watch_sessions',
  'wanted_cards',
  'user_achievements',
  'card_events',
  'user_cards',
  'checkins',
] as const;

export async function resetCurrentUserEarnedData(userId: string): Promise<ResetResult> {
  let deletedRemoteRecords = 0;
  for (const collectionName of RESET_COLLECTION_ORDER) {
    deletedRemoteRecords += await deleteUserRecords(collectionName, userId);
  }

  await resetMatchesToDefaults();
  await resetOptionalUserFlags(userId);
  const deletedLocalRecords = clearLocalUserRecords(userId);

  return {
    deletedRemoteRecords,
    deletedLocalRecords,
  };
}

async function deleteUserRecords(collectionName: string, userId: string) {
  try {
    const records = await pb.collection(collectionName).getFullList<{ id: string }>({
      filter: `user = "${userId}"`,
    });
    let deleted = 0;
    for (const record of records) {
      try {
        await pb.collection(collectionName).delete(record.id);
        deleted += 1;
      } catch {}
    }
    return deleted;
  } catch {
    return 0;
  }
}

async function resetMatchesToDefaults() {
  clearLocalMatchStatusOverrides();
}

async function resetOptionalUserFlags(userId: string) {
  try {
    await pb.collection('users').update(userId, {
      starterPackOpened: false,
      starterPackOpenedAt: null,
      onboardingCompleted: false,
      fanXp: 0,
    });
  } catch {
    // Optional fields may not exist in local/dev schemas.
  }
}

function clearLocalUserRecords(userId: string) {
  if (typeof globalThis.localStorage === 'undefined') return 0;

  let deleted = 0;
  const keysToDelete: string[] = [];
  for (let index = 0; index < globalThis.localStorage.length; index += 1) {
    const key = globalThis.localStorage.key(index);
    if (!key) continue;
    if (LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(`${prefix}${userId}.`))) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => {
    globalThis.localStorage.removeItem(key);
    deleted += 1;
  });

  return deleted;
}
