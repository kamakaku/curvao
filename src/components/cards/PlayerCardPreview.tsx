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

export function PlayerCardPreview({ card, player, club, size = 'compact' }: PlayerCardPreviewProps) {
  const playerImage = getPlayerCardImageSource(player);
  const clubCrest = getClubCrestSource(club.id);
  const primaryColor = club.primaryColor || '#DC052D';
  const [firstName = player.displayName, ...rest] = player.displayName.split(' ');
  const lastName = rest.join(' ') || player.lastName || player.displayName;
  const jerseyNumber = player.shirtNumber ? String(player.shirtNumber) : '';
  const giantWord = (jerseyNumber || (lastName || player.displayName).slice(0, 3)).toUpperCase();
  const large = size === 'large';

  return (
    <View style={styles.container}>
      <View style={[styles.cardBase, large && styles.cardBaseLarge]}>
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <TextureOverlay opacity={0.08} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.42)']} style={StyleSheet.absoluteFill} />

          <Text style={[styles.bgWord, large && styles.bgWordLarge]}>{giantWord}</Text>

          <View style={[styles.topRow, large && styles.topRowLarge]}>
            <Text style={[styles.rarity, large && styles.rarityLarge]}>{formatRarity(card.rarity).toUpperCase()}</Text>
          </View>

          <View style={[styles.playerImageContainer, large && styles.playerImageContainerLarge]}>
            <Image source={playerImage} style={styles.playerImage} contentFit="contain" contentPosition="bottom center" />
          </View>

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.55)']} style={styles.bottomFade} />

          <View style={[styles.nameBlock, large && styles.nameBlockLarge]}>
            <Text adjustsFontSizeToFit minimumFontScale={0.65} style={[styles.firstName, large && styles.firstNameLarge]} numberOfLines={1}>{firstName.toUpperCase()}</Text>
            <Text adjustsFontSizeToFit minimumFontScale={0.58} style={[styles.lastName, large && styles.lastNameLarge]} numberOfLines={2}>{lastName.toUpperCase()}</Text>
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
    fontSize: 128,
    fontWeight: '900',
    left: 4,
    letterSpacing: -6,
    opacity: 0.72,
    position: 'absolute',
    top: 12,
  },
  bgWordLarge: {
    fontSize: 170,
    left: 8,
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
  crest: {
    height: 34,
    width: 34,
  },
  crestLarge: {
    height: 48,
    width: 48,
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
    right: 96,
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
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 28,
  },
  lastNameLarge: {
    fontSize: 42,
    lineHeight: 40,
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
