import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { formatOrigin, formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const cardBaseBlank = require('@/assets/cards/player_card_base_blank.png');

export function ClubCardPreview({ card }: { card: UserCard }) {
  const { club } = getCardRelations(card);
  const primaryColor = club?.primaryColor || '#16181A';
  const secondaryColor = club?.secondaryColor || '#0D0F10';
  const crestSource = getClubCrestSource(club);
  const rarityLabel = formatRarity(card.rarity).toUpperCase();
  const clubName = club?.name || card.title;
  const clubMeta = [club?.city, club?.country].filter(Boolean).join(' · ').toUpperCase() || 'CLUB CARD';

  return (
    <View style={styles.container}>
      <View style={[styles.cardBase, { backgroundColor: secondaryColor }]}>
        <Image source={cardBaseBlank} style={StyleSheet.absoluteFill} contentFit="cover" />
        <TextureOverlay opacity={0.08} style={styles.texture} />

        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <Text style={styles.rarity}>{rarityLabel}</Text>
          <Image source={crestSource} style={styles.crest} contentFit="contain" />
          <Text style={styles.heroLabel}>CLUB</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>{clubName}</Text>
          <Text style={styles.meta} numberOfLines={1}>{clubMeta}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.origin}>{formatOrigin(card.origin)}</Text>
          <Text style={styles.type}>CLUB CARD</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 0.7,
  },
  cardBase: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.24)',
    overflow: 'hidden',
  },
  texture: {
    borderRadius: 8,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 14,
    gap: 8,
  },
  rarity: {
    color: curvao.colors.gold,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  crest: {
    width: 72,
    height: 72,
  },
  heroLabel: {
    color: '#F4F1E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  name: {
    color: '#F4F1E8',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  meta: {
    color: '#A7A39A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(216,170,77,0.18)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  origin: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: '900',
  },
  type: {
    color: '#A7A39A',
    fontSize: 9,
    fontWeight: '800',
  },
});
