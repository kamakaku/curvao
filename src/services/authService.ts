import type { AuthModel } from 'pocketbase';

import { pb, tryPocketBase } from '@/src/services/pocketbase';

export type CurrentUser = {
  id: string;
  displayName: string;
  onboardingCompleted?: boolean;
};

export type RegisterInput = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  username?: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return tryPocketBase(
    async () => {
      if (pb.authStore.record?.id) {
        return {
          id: pb.authStore.record.id,
          displayName: String(pb.authStore.record.name || pb.authStore.record.email || 'Curvao Fan'),
          onboardingCompleted: pb.authStore.record.onboardingCompleted,
        };
      }

      throw new Error('No authenticated user');
    },
    () => { throw new Error('Auth failed'); },
  );
}

export async function loginWithEmail(email: string, password: string): Promise<AuthModel> {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    console.log('PocketBase login response:', authData);
    return authData.record as AuthModel;
  } catch (error) {
    console.error('PocketBase login failed:', error);
    throw error;
  }
}

export async function registerWithEmail(input: RegisterInput): Promise<AuthModel> {
  const authData = await pb.collection('users').create({
    email: input.email,
    password: input.password,
    passwordConfirm: input.passwordConfirm,
    name: input.name,
    username: input.username,
  });
  return authData as AuthModel;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await pb.collection('users').requestPasswordReset(email);
}

export async function updateUserProfile(input: { name?: string; username?: string; avatar?: string }): Promise<AuthModel> {
  const userId = pb.authStore.model?.id;
  if (!userId) {
    throw new Error('No authenticated user to update profile.');
  }
  return await pb.collection('users').update(userId, input);
}

export async function logout(): Promise<void> {
  pb.authStore.clear();
}