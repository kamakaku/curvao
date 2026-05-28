import PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';

export const POCKETBASE_URL =
  process.env.EXPO_PUBLIC_POCKETBASE_URL?.trim() || 'http://127.0.0.1:8090';

export const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

export function isPocketBaseError(error: unknown) {
  return error instanceof Error || typeof error === 'object';
}

export async function tryPocketBase<T>(operation: () => Promise<T>, fallback: () => T | Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (__DEV__) {
      console.error('[PocketBase] Operation failed:', error);
    }
    return fallback();
  }
}

type PocketBaseFileRecord = Pick<RecordModel, 'id'> & Partial<RecordModel>;

export function getPocketBaseFileUrl(record?: PocketBaseFileRecord, fileName?: string) {
  if (!record || !fileName) {
    return undefined;
  }

  return pb.files.getURL(record as RecordModel, fileName);
}
