import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource, getPlayerCardImageSource } from '@/src/services/cardAssetService';
import { formatRarity } from '@/src/services/cardTemplateService';
import type { Club, Player, UserCard } from '@/src/types/models';

const CURVAO = {
  card: '#1B1F24',
  text: '#F4F1E8',
  muted: 'rgba(255,255,255,0.72)',
  border: 'rgba(255,255,255,0.08)',
};

type PlayerCardPreviewProps = {
  card: UserCard;
  player: Player;
  club: Club;
  size?: 'compact' | 'large';
};

function getResponsiveBgSize(text: string, large: boolean) {
  const base = large ? 170 : 128;
  const length = Math.max(1, text.length);
  if (length <= 2) return base;
  if (length === 3) return large ? 156 : 116;
  if (length === 4) return large ? 138 : 100;
  return large ? 118 : 86;
}

function getResponsiveLastNameSize(text: string, large: boolean) {
  const length = Math.max(1, text.length);
  if (large) {
    if (length <= 8) return 42;
    if (length <= 11) return 36;
    if (length <= 14) return 30;
    return 25;
  }

  if (length <= 8) return 28;
  if (length <= 11) return 24;
  if (length <= 14) return 20;
  return 17;
}

export function PlayerCardPreview({ card, player, club, size = 'compact' }: PlayerCardPreviewProps) {
  const playerImage = getPlayerCardImageSource(player);
  const clubCrest = getClubCrestSource(club);
  const primaryColor = club.primaryColor || '#DC052D';
  const [firstName = player.displayName, ...rest] = player.displayName.split(' ');
  const lastName = rest.join(' ') || player.lastName || player.displayName;
  const jerseyNumber = player.shirtNumber ? String(player.shirtNumber) : '';
  const giantWord = (jerseyNumber || (lastName || player.displayName).slice(0, 3)).toUpperCase();
  const large = size === 'large';
  const bgFontSize = getResponsiveBgSize(giantWord, large);
  const lastNameFontSize = getResponsiveLastNameSize(lastName.toUpperCase(), large);
  const lastNameLineHeight = Math.round(lastNameFontSize * 0.95);

  return (
    <View style={styles.container}>
      <View style={[styles.cardBase, large && styles.cardBaseLarge]}>
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <TextureOverlay opacity={0.08} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.42)']} style={StyleSheet.absoluteFill} />

          <Text
            style={[
              styles.bgWord,
              large && styles.bgWordLarge,
              { fontSize: bgFontSize },
            ]}
          >
            {giantWord}
          </Text>

          <View style={[styles.topRow, large && styles.topRowLarge]}>
            <Text style={[styles.rarity, large && styles.rarityLarge]}>{formatRarity(card.rarity).toUpperCase()}</Text>
            {!large && clubCrest ? (
              <Image source={clubCrest} style={styles.crestCompact} contentFit="contain" />
            ) : null}
          </View>

          <View style={[styles.playerImageContainer, large && styles.playerImageContainerLarge]}>
            <Image source={playerImage} style={styles.playerImage} contentFit="contain" contentPosition="bottom center" />
          </View>

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.55)']} style={styles.bottomFade} />

          <View style={[styles.nameBlock, large && styles.nameBlockLarge]}>
            <Text style={[styles.firstName, large && styles.firstNameLarge]} numberOfLines={1}>{firstName.toUpperCase()}</Text>
            <Text
              style={[
                styles.lastName,
                large && styles.lastNameLarge,
                { fontSize: lastNameFontSize, lineHeight: lastNameLineHeight },
              ]}
            >
              {lastName.toUpperCase()}
            </Text>
          </View>

          {large ? (
            <View style={styles.bottomClubMeta}>
              <Image source={clubCrest} style={styles.bottomClubCrest} contentFit="contain" />
              <Text adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={1} style={styles.bottomClubPosition}>
                {player.position.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        {!large ? (
          <View style={styles.footer}>
            <Text adjustsFontSizeToFit minimumFontScale={0.7} style={styles.meta} numberOfLines={1}>
              {player.position} · {club.name}
            </Text>
            <Text adjustsFontSizeToFit minimumFontScale={0.7} style={styles.subMeta} numberOfLines={1}>
              {card.subtitle || 'PLAYER CARD'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  cardBase: {
    flex: 1,
    backgroundColor: CURVAO.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CURVAO.border,
    overflow: 'hidden',
  },
  cardBaseLarge: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  hero: {
    flex: 1,
    minHeight: '74%',
    overflow: 'hidden',
  },
  bgWord: {
    color: '#14161A',
    fontWeight: '900',
    letterSpacing: -6,
    opacity: 0.72,
    position: 'absolute',
    right: 4,
    left: 4,
    textAlign: 'center',
    top: 12,
  },
  bgWordLarge: {
    left: 8,
    right: 8,
    top: 24,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    zIndex: 3,
  },
  topRowLarge: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  rarity: {
    color: CURVAO.text,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rarityLarge: {
    fontSize: 12,
  },
  crestCompact: {
    height: 20,
    width: 20,
    opacity: 0.85,
  },
  playerImageContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 24,
    zIndex: 2,
  },
  playerImageContainerLarge: {
    top: 36,
  },
  playerImage: {
    height: '100%',
    width: '100%',
  },
  bottomFade: {
    bottom: 0,
    height: '45%',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  nameBlock: {
    bottom: 12,
    left: 12,
    position: 'absolute',
    right: 12,
    zIndex: 3,
  },
  nameBlockLarge: {
    bottom: 18,
    left: 18,
    right: 18,
  },
  firstName: {
    color: CURVAO.text,
    fontSize: 14,
    fontWeight: '900',
    opacity: 0.92,
  },
  firstNameLarge: {
    fontSize: 20,
  },
  lastName: {
    color: CURVAO.text,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  lastNameLarge: {
    letterSpacing: -1.4,
  },
  footer: {
    backgroundColor: '#1D2126',
    gap: 4,
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  footerLarge: {
    gap: 6,
    minHeight: 90,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  meta: {
    color: CURVAO.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  metaLarge: {
    fontSize: 13,
  },
  subMeta: {
    color: CURVAO.muted,
    fontSize: 9,
    fontWeight: '700',
  },
  subMetaLarge: {
    fontSize: 12,
  },
  bottomClubMeta: {
    alignItems: 'center',
    bottom: 18,
    gap: 8,
    position: 'absolute',
    right: 18,
    zIndex: 3,
  },
  bottomClubCrest: {
    height: 42,
    width: 42,
  },
  bottomClubPosition: {
    color: CURVAO.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
