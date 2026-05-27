import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';

import { StadiumLargeCardBack } from '@/src/components/cards/StadiumLargeCardBack';
import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { formatRarity, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import type { UserCard } from '@/src/types/models';

const cardBaseBlank = require('@/assets/cards/player_card_base_blank.png');
const olympiastadionImage = require('@/assets/cards/olympiastadion_reference.png');

const CURVAO = {
  surface: '#080A09',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  mint: '#22C878',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
};

const CARD_WIDTH = 380;
const CARD_HEIGHT = 543;

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function StadiumLargeCard({ card, isFlipped }: { card: UserCard; isFlipped?: boolean }) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => setInternalFlipped(!flipped)} style={styles.container}>
        {!flipped ? (
          <StadiumLargeCardFront card={card} />
        ) : (
          <View style={styles.backWrapper}>
            <StadiumLargeCardBack card={card} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

function StadiumLargeCardFront({ card }: { card: UserCard }) {
  const { stadium, stadiumClub, homeClub } = getCardRelations(card);
  const stadiumImageUrl = getPocketBaseFileUrl(stadium, stadium?.image) ?? getPocketBaseFileUrl(card, card.stadiumImage);
  const stadiumImageSource: ImageSourcePropType = stadiumImageUrl ? { uri: stadiumImageUrl } : olympiastadionImage;
  
  const rarityLabel = formatRarity(card.rarity).toUpperCase();
  const seasonText = "2025/26";
  const acquisitionDate = formatDate(card.acquiredAt);
  const editionText = card.editionNumber 
    ? `#${card.editionNumber}${card.editionSize ? ` / ${card.editionSize.toLocaleString('de-DE')}` : ''}`
    : 'OPEN EDITION';

  return (
    <View style={styles.cardBase}>
      <Image source={cardBaseBlank} style={styles.backgroundImage} />
      <TextureOverlay opacity={0.15} />

      {/* Hero Section: Stadium Image with Fade */}
      <View style={styles.heroLayer}>
        <Image source={stadiumImageSource} style={styles.stadiumImage} contentFit="cover" />
        <LinearGradient
          colors={[
            'rgba(8, 10, 9, 1)', 
            'rgba(8, 10, 9, 0)', 
            'rgba(8, 10, 9, 0)', 
            'rgba(8, 10, 9, 1)'
          ]}
          locations={[0, 0.15, 0.8, 1]}
          style={styles.imageFade}
        />
      </View>

      {/* Overlays */}
      <View style={styles.contentContainer} pointerEvents="none">
        <View style={styles.topLeft}>
          <Text style={styles.rarityLabel}>{rarityLabel}</Text>
          <RarityStars rarity={card.rarity} />
        </View>

        <View style={styles.topRight}>
          <Text style={styles.seasonLabelTop}>COLLECTION</Text>
          <Text style={styles.seasonValueTop}>{seasonText}</Text>
        </View>

        {/* Info Rail */}
        <View style={styles.leftRail}>
          <Ionicons name="map-outline" size={24} color={CURVAO.gold} />
          <View style={styles.railDivider} />
          <Text style={styles.railMeta}>STAD</Text>
        </View>

        {/* Name Block (Stadium) */}
        <View style={styles.nameBlock}>
          <Text style={styles.stadiumName} numberOfLines={1} adjustsFontSizeToFit>
            {stadium?.name?.split(' ')[0].toUpperCase() || card.title.toUpperCase()}
          </Text>
          <Text style={styles.metaSubline}>
            {stadium?.city?.toUpperCase() || 'VERIFIED LOCATION'}
          </Text>
        </View>

        <View style={styles.statsDivider} />
        <View style={styles.statsRow}>
          <StatColumn icon="shield-checkmark-outline" label="VERIFIED" value="GPS DATA" />
          <View style={styles.statSeparator} />
          <StatColumn icon="people-outline" label="CAPACITY" value={stadium?.capacity ? `${(stadium.capacity/1000).toFixed(0)}K` : '—'} />
          <View style={styles.statSeparator} />
          <StatColumn icon="checkmark-circle-outline" label="VISITS" value={String(card.stadiumVisitCount ?? 1)} />
          <View style={styles.statSeparator} />
          <StatColumn 
            icon="heart-outline" 
            label="STATUS" 
            value={card.favoriteStadium ? 'FAVORITE' : 'VISITED'} 
            valueStyle={{ color: card.favoriteStadium ? CURVAO.gold : CURVAO.text }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ACQUIRED ON {acquisitionDate}</Text>
          <Text style={styles.footerText}>EDITION {editionText}</Text>
        </View>
      </View>
    </View>
  );
}

function RarityStars({ rarity }: { rarity: string }) {
  const stars = rarity === 'standard' ? 1 : rarity === 'rare' ? 2 : 3;
  return (
    <View style={styles.starsRow}>
      {[...Array(3)].map((_, i) => (
        <Ionicons key={i} name={i < stars ? "star" : "star-outline"} size={14} color={CURVAO.gold} />
      ))}
    </View>
  );
}

function StatColumn({ icon, label, value, valueStyle }: { icon: keyof typeof Ionicons.glyphMap, label: string, value: string, valueStyle?: any }) {
  return (
    <View style={styles.statColumn}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={12} color={CURVAO.gold} />
      </View>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'visible',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
  },
  backWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06100c',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBase: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#080A09',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: 'stretch',
  },
  heroLayer: {
    position: 'absolute',
    top: '14%',
    left: '12%',
    right: '12%',
    height: '42%',
    zIndex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stadiumImage: {
    width: '100%',
    height: '100%',
  },
  imageFade: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  topLeft: {
    position: 'absolute',
    left: '7%',
    top: '5.5%',
  },
  rarityLabel: {
    color: CURVAO.gold,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  topRight: {
    position: 'absolute',
    right: '7%',
    top: '5.5%',
    alignItems: 'flex-end',
  },
  seasonLabelTop: {
    color: CURVAO.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  seasonValueTop: {
    color: CURVAO.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  leftRail: {
    position: 'absolute',
    left: '7%',
    top: '18%',
    width: '15%',
    alignItems: 'center',
  },
  railDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(216,170,77,0.3)',
    marginVertical: 10,
  },
  railMeta: {
    color: CURVAO.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nameBlock: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '26%',
    alignItems: 'center',
  },
  stadiumName: {
    color: CURVAO.gold,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  metaSubline: {
    color: CURVAO.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 0,
    opacity: 0.8,
  },
  statsDivider: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '22.5%',
    height: 1,
    backgroundColor: 'rgba(216,170,77,0.22)',
  },
  statsRow: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '9%',
    height: '12%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statLabel: {
    color: CURVAO.muted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statValue: {
    color: CURVAO.text,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 11,
  },
  statSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(216,170,77,0.15)',
  },
  footer: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '2.5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: CURVAO.gold,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.6,
  },
});
