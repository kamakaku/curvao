import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { formatOrigin, formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import type { UserCard, Club } from '@/src/types/models';

const cardBaseBlank = require('@/assets/cards/player_card_base_blank.png');

const ARTIFACT_STYLE = {
  surface: '#121614',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  textPrimary: '#F4F1E8',
  textMuted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
  verifiedMint: '#22C878',
};

function getCrestSource(club?: Club): ImageSourcePropType | undefined {
  const crestUrl = getPocketBaseFileUrl(club, club?.crest);
  return crestUrl ? { uri: crestUrl } : getClubCrestSource(club?.id);
}

export function MatchCardPreview({ card }: { card: UserCard }) {
  const { match, homeClub, awayClub } = getCardRelations(card);
  const homeCrest = getCrestSource(homeClub);
  const awayCrest = getCrestSource(awayClub);
  
  const rarityLabel = formatRarity(card.rarity).toUpperCase();
  const stars = card.rarity === 'standard' ? 1 : card.rarity === 'rare' ? 2 : 3;

  return (
    <View style={styles.container}>
      <View style={styles.cardBase}>
        <Image source={cardBaseBlank} style={StyleSheet.absoluteFill} contentFit="cover" />
        <TextureOverlay opacity={0.1} style={styles.texture} />

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
        </View>

        {/* Middle Section: Crests & Score - Now Absolute for better visibility */}
        <View style={styles.heroLayer}>
          <View style={styles.crestsContainer}>
            <Image source={homeCrest} style={styles.crest} contentFit="contain" />
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                {match?.homeScore ?? '–'}:{match?.awayScore ?? '–'}
              </Text>
            </View>
            <Image source={awayCrest} style={styles.crest} contentFit="contain" />
          </View>
        </View>

        {/* Content Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(8, 10, 9, 0.8)', 'rgba(8, 10, 9, 1)']}
          style={styles.contentOverlay}
        >
          <View style={styles.bottomInfo}>
            <Text style={styles.matchName} numberOfLines={1} adjustsFontSizeToFit>
              {homeClub?.shortName || 'HOME'} VS {awayClub?.shortName || 'AWAY'}
            </Text>
            <Text style={styles.matchMeta}>
              {match?.competition?.toUpperCase() || 'VERIFIED MATCH'}
            </Text>
            
            <View style={styles.footerRow}>
              <View style={styles.originBadge}>
                <Ionicons name="shield-checkmark-outline" size={10} color={ARTIFACT_STYLE.verifiedMint} />
                <Text style={styles.originLabel}>{formatOrigin(card.origin)}</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeLabel}>MATCH</Text>
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
  topSection: {
    padding: 8,
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
  heroLayer: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  crestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  crest: {
    width: 50,
    height: 50,
  },
  scoreContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(216,170,77,0.2)',
  },
  scoreText: {
    color: ARTIFACT_STYLE.gold,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  contentOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    justifyContent: 'flex-end',
    padding: 10,
    zIndex: 10,
  },
  bottomInfo: {
    gap: 1,
  },
  matchName: {
    color: ARTIFACT_STYLE.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  matchMeta: {
    color: ARTIFACT_STYLE.textMuted,
    fontSize: 9,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(34, 200, 120, 0.3)',
  },
  originLabel: {
    color: ARTIFACT_STYLE.verifiedMint,
    fontSize: 7,
    fontWeight: '900',
  },
  typeBadge: {
    backgroundColor: 'rgba(216, 170, 77, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeLabel: {
    color: ARTIFACT_STYLE.gold,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
});