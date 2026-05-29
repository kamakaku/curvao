export type AssetMode = 'production' | 'internal_demo';

const requestedAssetMode: AssetMode = process.env.EXPO_PUBLIC_ASSET_MODE === 'internal_demo' ? 'internal_demo' : 'production';

let warnedUnsafeDemoMode = false;

export function getAssetMode(): AssetMode {
  if (!__DEV__ && requestedAssetMode === 'internal_demo') {
    if (!warnedUnsafeDemoMode) {
      warnedUnsafeDemoMode = true;
      if (__DEV__) {
        console.warn('[assets] internal_demo mode is not allowed outside development. Falling back to production.');
      }
    }
    return 'production';
  }

  return requestedAssetMode;
}

export function canUseDemoAssets() {
  return __DEV__ && getAssetMode() === 'internal_demo';
}

export function canUseProductionAssets() {
  return true;
}
