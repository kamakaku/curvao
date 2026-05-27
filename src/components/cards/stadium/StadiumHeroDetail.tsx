import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import type { UserCard } from '@/src/types/models';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = (SCREEN_HEIGHT * 3) / 5;

const olympiastadionImage = require('@/assets/cards/olympiastadion_reference.png');

const HERO_COLORS = {
  bg: '#080A09',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  mint: '#22C878',
};

type StadiumHeroDetailProps = {
  card: UserCard;
};

export function StadiumHeroDetail({ card }: StadiumHeroDetailProps) {
  const insets = useSafeAreaInsets();
  const { stadium, stadiumClub } = getCardRelations(card);
  
  const stadiumImageUrl = getPocketBaseFileUrl(stadium, stadium?.image) ?? getPocketBaseFileUrl(card, card.stadiumImage);
  const stadiumImageSource = stadiumImageUrl ? { uri: stadiumImageUrl } : olympiastadionImage;
  const primaryColor = stadiumClub?.primaryColor || '#121614';

  return (
    <View style={styles.container}>
      <View style={[styles.heroCard, { backgroundColor: primaryColor, height: HERO_HEIGHT }]}>
        {/* Background Gradients */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFill}
        />
        
        <TextureOverlay opacity={0.15} />

        {/* Stadium Image Background */}
        <View style={styles.imageLayer}>
          <Image 
            source={stadiumImageSource} 
            style={StyleSheet.absoluteFill} 
            contentFit="cover" 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Top Meta */}
        <View style={[styles.topMeta, { paddingTop: Math.max(24, insets.top + 10) }]}>
          <View style={styles.topLeft}>
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>{formatRarity(card.rarity).toUpperCase()}</Text>
            </View>
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>2025/26 COLLECTION</Text>
            </View>
          </View>
          
          <View style={styles.topRight}>
            <View style={styles.typeBadge}>
              <Ionicons name="map" size={12} color="#FFF" />
              <Text style={styles.typeText}>STADIUM</Text>
            </View>
          </View>
        </View>

        {/* Name & City bottom left */}
        <View style={styles.bottomInfo}>
          <View style={styles.nameBlock}>
            <Text style={styles.cityName}>{stadium?.city?.toUpperCase() || 'CITY'}</Text>
            <Text 
                style={styles.stadiumName}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
            >
                {stadium?.name?.toUpperCase() || card.title.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.visitRow}>
            <Ionicons name="navigate-outline" size={14} color={HERO_COLORS.mint} />
            <Text style={styles.visitText}>GPS VERIFIED · {card.stadiumVisitCount ?? 1} VISITS</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
  },
  heroCard: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  topLeft: {
    gap: 6,
  },
  topRight: {},
  rarityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  rarityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  seasonBadge: {
    paddingLeft: 2,
  },
  seasonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.7,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    zIndex: 15,
  },
  nameBlock: {
    gap: 0,
    marginBottom: 8,
  },
  cityName: {
    color: HERO_COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  stadiumName: {
    color: '#FFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 56,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.9,
  },
  visitText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
