import { DEMO_USER_ID } from '@/src/data/mockData';
import { pb, tryPocketBase } from '@/src/services/pocketbase';

export type CurrentUser = {
  id: string;
  displayName: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return tryPocketBase(
    async () => {
      if (pb.authStore.record?.id) {
        return {
          id: pb.authStore.record.id,
          displayName: String(pb.authStore.record.displayName || pb.authStore.record.email || 'Curvao Fan'),
        };
      }

      const authData = await pb.collection('users').authWithPassword('demo@curvao.local', 'curvao-demo-password');
      return {
        id: authData.record.id,
        displayName: String(authData.record.displayName || authData.record.email || 'Curvao Fan'),
      };
    },
    () => ({ id: DEMO_USER_ID, displayName: 'Curvao Fan' }),
  );
}
