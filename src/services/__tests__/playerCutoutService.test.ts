import {
  getPlayerCutoutSource,
  getPositionPlaceholder,
  isCutoutAllowed,
  resolvePlayerCutoutManifestEntry,
} from '@/src/services/playerCutoutService';

function setAssetMode(value?: 'production' | 'internal_demo') {
  if (value) {
    process.env.EXPO_PUBLIC_ASSET_MODE = value;
  } else {
    delete process.env.EXPO_PUBLIC_ASSET_MODE;
  }
}

describe('playerCutoutService', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    (global as any).__DEV__ = originalDev;
  });

  it('licensed asset is allowed in production', () => {
    expect(
      isCutoutAllowed(
        {
          playerSlug: 'licensed-sample',
          source: 'licensed_provider',
          licenseStatus: 'licensed',
          usageScope: 'card_asset',
          approvedFor: ['production'],
        },
        'production',
      ),
    ).toBe(true);
  });

  it('demo_only asset is not allowed in production', () => {
    expect(
      isCutoutAllowed(
        {
          playerSlug: 'demo-sample',
          source: 'local_demo',
          licenseStatus: 'demo_only',
          usageScope: 'internal_demo',
          approvedFor: ['internal_demo', 'dev'],
        },
        'production',
      ),
    ).toBe(false);
  });

  it('demo_only asset is allowed in internal_demo', () => {
    (global as any).__DEV__ = true;
    setAssetMode('internal_demo');
    expect(
      isCutoutAllowed(
        {
          playerSlug: 'demo-sample',
          source: 'local_demo',
          licenseStatus: 'demo_only',
          usageScope: 'internal_demo',
          approvedFor: ['internal_demo', 'dev'],
        },
        'internal_demo',
      ),
    ).toBe(true);
  });

  it('expired asset is not allowed', () => {
    expect(
      isCutoutAllowed(
        {
          playerSlug: 'expired-sample',
          source: 'licensed_provider',
          licenseStatus: 'licensed',
          usageScope: 'card_asset',
          approvedFor: ['production'],
          expiresAt: '2024-01-01T00:00:00.000Z',
        },
        'production',
      ),
    ).toBe(false);
  });

  it('unlicensed asset is never allowed', () => {
    expect(
      isCutoutAllowed(
        {
          playerSlug: 'unlicensed-sample',
          source: 'local_demo',
          licenseStatus: 'unlicensed',
          usageScope: 'card_asset',
          approvedFor: ['production', 'internal_demo'],
        },
        'internal_demo',
      ),
    ).toBe(false);
  });

  it('missing player uses position placeholder', () => {
    expect(getPositionPlaceholder('FW')).toBeDefined();
    expect(getPlayerCutoutSource({ displayName: 'Unknown Forward', position: 'FW' })).toBeDefined();
  });

  it('missing position uses generic placeholder', () => {
    expect(getPlayerCutoutSource({ displayName: 'Unknown Player' })).toBeDefined();
  });

  it('resolvePlayerCutoutManifestEntry finds sample entries', () => {
    const entry = resolvePlayerCutoutManifestEntry({ playerSlug: 'licensed-sample' });
    expect(entry?.playerSlug).toBe('licensed-sample');
  });

  it('getPlayerCardImageSource equivalent resolver never returns undefined', () => {
    expect(getPlayerCutoutSource({ playerId: 'nonexistent-player', variant: 'hero' })).toBeDefined();
    expect(getPlayerCutoutSource({ playerId: 'nonexistent-player', variant: 'thumb' })).toBeDefined();
  });
});
