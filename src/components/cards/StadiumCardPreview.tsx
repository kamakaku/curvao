import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import type { UserCard } from '@/src/types/models';

const cardBaseBlank = require('@/assets/cards/player_card_base_blank.png');
const olympiastadionImage = require('@/assets/cards/olympiastadion_reference.png');

const ARTIFACT_STYLE = {
  surface: '#121614',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  textPrimary: '#F4F1E8',
  textMuted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
  verifiedMint: '#22C878',
};

export function StadiumCardPreview({ card }: { card: UserCard }) {
  const { stadium } = getCardRelations(card);
  const stadiumImageUrl = getPocketBaseFileUrl(stadium, stadium?.image) ?? getPocketBaseFileUrl(card, card.stadiumImage);
  const stadiumImageSource: ImageSourcePropType = stadiumImageUrl ? { uri: stadiumImageUrl } : olympiastadionImage;
  
  const rarityLabel = formatRarity(card.rarity).toUpperCase();
  const stars = card.rarity === 'standard' ? 1 : card.rarity === 'rare' ? 2 : 3;

  return (
    <View style={styles.container}>
      <View style={styles.cardBase}>
        <Image source={cardBaseBlank} style={StyleSheet.absoluteFill} contentFit="cover" />
        <TextureOverlay opacity={0.1} style={styles.texture} />

        {/* Stadium Image Background with Fade */}
        <View style={styles.imageContainer}>
          <Image source={stadiumImageSource} style={styles.stadiumImage} contentFit="cover" />
          <LinearGradient
            colors={['rgba(8, 10, 9, 0.4)', 'transparent', 'transparent', 'rgba(8, 10, 9, 0.8)']}
            locations={[0, 0.2, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Top Section */}
        <View style={styles.topSection}>
          <View>
            <Text style={styles.rarityText}>{rarityLabel}</Text>
            <View style={styles.starsRow}>
              {[...Array(3)].map((_, i) => (
                <Ionicons key={i} name={i < stars ? "star" : "star-outline"} size={8} color={ARTIFACT_STYLE.gold} />
              ))}
            </View>
          </View>
          <Ionicons name="map-outline" size={14} color={ARTIFACT_STYLE.gold} opacity={0.6} />
        </View>

        {/* Content Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(8, 10, 9, 0.8)', 'rgba(8, 10, 9, 1)']}
          style={styles.contentOverlay}
        >
          <View style={styles.bottomInfo}>
            <Text style={styles.stadiumName} numberOfLines={1} adjustsFontSizeToFit>
              {stadium?.name?.split(' ')[0].toUpperCase() || card.title.toUpperCase()}
            </Text>
            <Text style={styles.stadiumMeta}>
              {stadium?.city?.toUpperCase() || 'VERIFIED LOCATION'}
            </Text>
            
            <View style={styles.footerRow}>
              <View style={styles.originBadge}>
                <Ionicons name="navigate-outline" size={10} color={ARTIFACT_STYLE.verifiedMint} />
                <Text style={styles.originLabel}>GPS VERIFIED</Text>
              </View>
              <View style={styles.visitBadge}>
                <Text style={styles.visitText}>{card.stadiumVisitCount ?? 1}x</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  cardBase: {
    flex: 1,
    backgroundColor: ARTIFACT_STYLE.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ARTIFACT_STYLE.borderGold,
    overflow: 'hidden',
    position: 'relative',
  },
  texture: {
    borderRadius: 8,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '30%',
    zIndex: 1,
  },
  stadiumImage: {
    width: '100%',
    height: '100%',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 6,
    zIndex: 20,
  },
  rarityText: {
    color: ARTIFACT_STYLE.gold,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 1,
  },
  contentOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 8,
    zIndex: 10,
  },
  bottomInfo: {
    gap: 1,
  },
  stadiumName: {
    color: ARTIFACT_STYLE.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stadiumMeta: {
    color: ARTIFACT_STYLE.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(34, 200, 120, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(34, 200, 120, 0.3)',
  },
  originLabel: {
    color: ARTIFACT_STYLE.verifiedMint,
    fontSize: 6,
    fontWeight: '900',
  },
  visitBadge: {
    backgroundColor: 'rgba(216, 170, 77, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  visitText: {
    color: ARTIFACT_STYLE.gold,
    fontSize: 7,
    fontWeight: '900',
  },
});
