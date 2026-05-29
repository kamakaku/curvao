import type { ImageSourcePropType } from 'react-native';

import { canUseDemoAssets, getAssetMode, type AssetMode } from '@/src/config/assetMode';

export type PlayerCutoutManifestEntry = {
  playerId?: string;
  playerSlug: string;
  displayName?: string;
  hero?: string;
  thumb?: string;
  source: 'club_upload' | 'licensed_provider' | 'curvao_placeholder' | 'local_demo';
  licenseStatus: 'licensed' | 'demo_only' | 'restricted' | 'expired' | 'unlicensed';
  usageScope: 'internal_demo' | 'app_display' | 'card_asset' | 'marketing';
  approvedFor: ('dev' | 'internal_demo' | 'production' | 'marketing')[];
  expiresAt?: string | null;
  credit?: string;
};

type PlayerCutoutManifest = {
  entries?: PlayerCutoutManifestEntry[];
};

type PlayerCutoutInput = {
  playerId?: string;
  playerSlug?: string;
  displayName?: string;
  position?: string;
  variant?: 'hero' | 'thumb';
};

const genericPlaceholder = require('@/assets/cards/player_placholder.png');

const assetPathMap: Record<string, ImageSourcePropType> = {
  'licensed/licensed_sample_hero.png': genericPlaceholder,
  'licensed/licensed_sample_thumb.png': genericPlaceholder,
  'licensed/expired_sample_hero.png': genericPlaceholder,
  'licensed/expired_sample_thumb.png': genericPlaceholder,
  'demo/demo_sample_hero.png': genericPlaceholder,
  'demo/demo_sample_thumb.png': genericPlaceholder,
  'demo/unlicensed_sample_hero.png': genericPlaceholder,
  'demo/unlicensed_sample_thumb.png': genericPlaceholder,
  'placeholders/generic_player_placeholder.png': genericPlaceholder,
  'placeholders/generic_player_placeholder_thumb.png': genericPlaceholder,
  'placeholders/forward_player_placeholder.png': genericPlaceholder,
  'placeholders/forward_player_placeholder_thumb.png': genericPlaceholder,
  'placeholders/midfielder_player_placeholder.png': genericPlaceholder,
  'placeholders/midfielder_player_placeholder_thumb.png': genericPlaceholder,
  'placeholders/defender_player_placeholder.png': genericPlaceholder,
  'placeholders/defender_player_placeholder_thumb.png': genericPlaceholder,
  'placeholders/goalkeeper_player_placeholder.png': genericPlaceholder,
  'placeholders/goalkeeper_player_placeholder_thumb.png': genericPlaceholder,
};

const manifestData = require('../../assets/player-cutouts/manifest.json') as PlayerCutoutManifest;
const manifestEntries = Array.isArray(manifestData) ? manifestData : manifestData.entries ?? [];
const warnedKeys = new Set<string>();

function warnOnce(key: string, message: string) {
  if (!__DEV__ || warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(message);
}

function slugify(value?: string) {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

function getManifestAsset(entry: PlayerCutoutManifestEntry, variant: 'hero' | 'thumb') {
  const assetPath = variant === 'thumb' ? entry.thumb || entry.hero : entry.hero || entry.thumb;
  return assetPath ? assetPathMap[assetPath] : undefined;
}

export function isCutoutAllowed(entry: PlayerCutoutManifestEntry, mode: AssetMode) {
  if (entry.licenseStatus === 'unlicensed') return false;
  if (entry.licenseStatus === 'expired' || isExpired(entry.expiresAt)) return false;
  if (entry.licenseStatus === 'restricted') return false;

  if (mode === 'production') {
    return (
      entry.licenseStatus === 'licensed' &&
      (entry.usageScope === 'card_asset' || entry.usageScope === 'app_display') &&
      entry.approvedFor.includes('production')
    );
  }

  if (entry.licenseStatus === 'demo_only') {
    return canUseDemoAssets() && (entry.approvedFor.includes('internal_demo') || entry.approvedFor.includes('dev'));
  }

  return (
    entry.licenseStatus === 'licensed' &&
    (entry.usageScope === 'card_asset' || entry.usageScope === 'app_display') &&
    (entry.approvedFor.includes('internal_demo') || entry.approvedFor.includes('dev') || entry.approvedFor.includes('production'))
  );
}

export function getPositionPlaceholder(position?: string): ImageSourcePropType {
  const normalized = (position || '').toUpperCase();
  if (normalized === 'FW' || normalized === 'ST' || normalized === 'FORWARD' || normalized === 'STURM') {
    return assetPathMap['placeholders/forward_player_placeholder.png'] ?? genericPlaceholder;
  }
  if (normalized === 'MF' || normalized === 'MIDFIELDER' || normalized === 'MITTE' || normalized === 'MIDFIELD') {
    return assetPathMap['placeholders/midfielder_player_placeholder.png'] ?? genericPlaceholder;
  }
  if (normalized === 'DF' || normalized === 'DEFENDER' || normalized === 'DEF' || normalized === 'VERTEIDIGUNG') {
    return assetPathMap['placeholders/defender_player_placeholder.png'] ?? genericPlaceholder;
  }
  if (normalized === 'GK' || normalized === 'GOALKEEPER' || normalized === 'TORWART') {
    return assetPathMap['placeholders/goalkeeper_player_placeholder.png'] ?? genericPlaceholder;
  }
  return genericPlaceholder;
}

export function resolvePlayerCutoutManifestEntry(input: PlayerCutoutInput): PlayerCutoutManifestEntry | null {
  const playerSlug = input.playerSlug || slugify(input.displayName);
  const byId = input.playerId ? manifestEntries.find((entry) => entry.playerId === input.playerId) : undefined;
  if (byId) return byId;
  if (playerSlug) {
    const bySlug = manifestEntries.find((entry) => entry.playerSlug === playerSlug);
    if (bySlug) return bySlug;
  }
  return null;
}

export function getPlayerCutoutSource(input: PlayerCutoutInput): ImageSourcePropType {
  const mode = getAssetMode();
  const variant = input.variant ?? 'hero';
  const entry = resolvePlayerCutoutManifestEntry(input);
  const playerSlug = input.playerSlug || slugify(input.displayName) || input.playerId || 'unknown-player';

  if (entry) {
    if (isExpired(entry.expiresAt) || entry.licenseStatus === 'expired') {
      warnOnce(`expired:${playerSlug}`, `[cutouts] Asset for ${playerSlug} is expired. Using placeholder.`);
    } else if (!isCutoutAllowed(entry, mode)) {
      warnOnce(`blocked:${playerSlug}`, `[cutouts] Asset for ${playerSlug} exists but is not allowed in ${mode}. Using placeholder.`);
    } else {
      const asset = getManifestAsset(entry, variant);
      if (asset) {
        if (entry.licenseStatus === 'demo_only') {
          warnOnce(`demo:${playerSlug}`, `[cutouts] Demo asset used for ${playerSlug}.`);
        }
        return asset;
      }
    }
  }

  const positionPlaceholder = getPositionPlaceholder(input.position);
  if (positionPlaceholder !== genericPlaceholder) {
    warnOnce(`position:${playerSlug}`, `[cutouts] No approved cutout for ${playerSlug}. Using position placeholder.`);
    return positionPlaceholder;
  }

  warnOnce(`generic:${playerSlug}`, `[cutouts] No approved cutout for ${playerSlug}. Using generic placeholder.`);
  return genericPlaceholder;
}
