import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource, getPlayerImageSourceFromRecord } from '@/src/services/cardAssetService';
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
};

export function PlayerCardPreview({ card, player, club }: PlayerCardPreviewProps) {
  const playerImage = getPlayerImageSourceFromRecord(player);
  const clubCrest = getClubCrestSource(club.id);
  const primaryColor = club.primaryColor || '#DC052D';
  const [firstName = player.displayName, ...rest] = player.displayName.split(' ');
  const lastName = rest.join(' ') || player.lastName || player.displayName;
  const giantWord = (lastName || player.displayName).slice(0, 3).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.cardBase}>
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <TextureOverlay opacity={0.08} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.42)']} style={StyleSheet.absoluteFill} />

          <Text style={styles.bgWord}>{giantWord}</Text>

          <View style={styles.topRow}>
            <Text style={styles.rarity}>{formatRarity(card.rarity).toUpperCase()}</Text>
            <Image source={clubCrest} style={styles.crest} contentFit="contain" />
          </View>

          <View style={styles.playerImageContainer}>
            <Image source={playerImage} style={styles.playerImage} contentFit="contain" contentPosition="bottom center" />
          </View>

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.55)']} style={styles.bottomFade} />

          <View style={styles.nameBlock}>
            <Text style={styles.firstName} numberOfLines={1}>{firstName.toUpperCase()}</Text>
            <Text style={styles.lastName} numberOfLines={2}>{lastName.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.meta} numberOfLines={1}>
            {player.position} · {club.name}
          </Text>
          <Text style={styles.subMeta} numberOfLines={1}>
            {card.subtitle || 'PLAYER CARD'}
          </Text>
        </View>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CURVAO.border,
    overflow: 'hidden',
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
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    zIndex: 3,
  },
  rarity: {
    color: CURVAO.text,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  crest: {
    height: 34,
    width: 34,
  },
  playerImageContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 24,
    zIndex: 2,
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
  firstName: {
    color: CURVAO.text,
    fontSize: 14,
    fontWeight: '900',
    opacity: 0.92,
  },
  lastName: {
    color: CURVAO.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 28,
  },
  footer: {
    backgroundColor: '#1D2126',
    gap: 4,
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  meta: {
    color: CURVAO.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  subMeta: {
    color: CURVAO.muted,
    fontSize: 9,
    fontWeight: '700',
  },
});
