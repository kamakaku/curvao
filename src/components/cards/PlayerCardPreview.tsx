import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource, getPlayerImageSource } from '@/src/services/cardAssetService';
import { formatRarity } from '@/src/services/cardTemplateService';
import type { CardOrigin, Rarity, UserCard, Player, Club } from '@/src/types/models';

const stadiumBackgroundSource = require('@/assets/cards/player_standard_v2_bg.png');

const CURVAO = {
  surface: '#121614',
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  mint: '#22C878',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
};

type OriginDisplay = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'neutral' | 'mint' | 'gold' | 'special';
};

function getPlayerCardOriginDisplay(origin: CardOrigin): OriginDisplay {
  switch (origin) {
    case 'starter_pack':
      return { label: 'STARTER', icon: 'albums-outline', tone: 'neutral' };
    case 'fan_claimed':
    case 'self_earned':
      return { label: 'FAN CLAIMED', icon: 'archive-outline', tone: 'neutral' };
    case 'live_verified':
    case 'logged_viewing':
      return { label: 'LIVE VERIFIED', icon: 'eye-outline', tone: 'mint' };
    case 'stadium_verified':
      return { label: 'STADIUM VERIFIED', icon: 'shield-checkmark-outline', tone: 'gold' };
    case 'special_moment':
      return { label: 'SPECIAL MOMENT', icon: 'sparkles-outline', tone: 'special' };
    case 'club_reward':
    case 'club_drop':
    case 'event_drop':
      return { label: 'CLUB REWARD', icon: 'ribbon-outline', tone: 'neutral' };
    case 'season_reward':
      return { label: 'SEASON REWARD', icon: 'trophy-outline', tone: 'gold' };
    default:
      return { label: 'COLLECTED', icon: 'checkmark-circle-outline', tone: 'neutral' };
  }
}

function formatBondLevel(level?: number) {
  return `BOND ${level ?? 1}`;
}

type PlayerCardPreviewProps = {
  card: UserCard;
  player: Player;
  club: Club;
};

export function PlayerCardPreview({ card, player, club }: PlayerCardPreviewProps) {
  const playerImage = getPlayerImageSource(player.id);
  const clubCrest = getClubCrestSource(club.id);
  const originDisplay = getPlayerCardOriginDisplay(card.origin);

  const renderStars = (rarity: Rarity) => {
    const stars = rarity === 'standard' ? 1 : rarity === 'rare' ? 2 : rarity === 'epic' ? 3 : 5;
    return (
      <View style={styles.starsRow}>
        {[...Array(3)].map((_, i) => (
          <Ionicons 
            key={i} 
            name={i < stars ? "star" : "star-outline"} 
            size={8} 
            color={CURVAO.gold} 
          />
        ))}
      </View>
    );
  };

  const getOriginBadgeStyle = (tone: OriginDisplay['tone']) => {
    switch (tone) {
      case 'mint':
        return { 
          container: styles.badgeMint, 
          text: { color: CURVAO.mint },
          iconColor: CURVAO.mint 
        };
      case 'gold':
      case 'special':
        return { 
          container: styles.badgeGold, 
          text: { color: CURVAO.goldSoft },
          iconColor: CURVAO.goldSoft 
        };
      default:
        return { 
          container: styles.badgeNeutral, 
          text: { color: CURVAO.muted },
          iconColor: CURVAO.muted 
        };
    }
  };

  const badgeStyle = getOriginBadgeStyle(originDisplay.tone);

  return (
    <View style={styles.container}>
      {/* Base Layer */}
      <View style={styles.cardBase}>
        {/* Stadium Background */}
        <Image 
          source={stadiumBackgroundSource} 
          style={StyleSheet.absoluteFill} 
          contentFit="cover"
        />

        {/* Background texture */}
        <TextureOverlay opacity={0.1} style={styles.texture} />

        {/* Top Section: Rarity & Club */}
        <View style={styles.topSection}>
          <View>
            <Text style={styles.rarityText}>{formatRarity(card.rarity).toUpperCase()}</Text>
            {renderStars(card.rarity)}
          </View>
          {clubCrest && (
            <Image source={clubCrest} style={styles.clubCrest} contentFit="contain" />
          )}
        </View>

        {/* Middle Section: Player Image */}
        <View style={styles.imageContainer}>
          {playerImage && (
            <Image source={playerImage} style={styles.playerImage} contentFit="contain" />
          )}
        </View>

        {/* Content Overlay - Name & Stats */}
        <LinearGradient
          colors={['transparent', 'rgba(8, 10, 9, 0.6)', 'rgba(8, 10, 9, 0.95)']}
          style={styles.contentOverlay}
        >
          <View style={styles.bottomInfo}>
            <Text 
              style={styles.playerName} 
              numberOfLines={1} 
              adjustsFontSizeToFit
            >
              {player.lastName.toUpperCase()}
            </Text>
            <Text style={styles.playerMeta}>
              {player.position} · {club.shortName || club.name.substring(0, 3).toUpperCase()}
            </Text>
            
            <View style={styles.footerRow}>
              <View style={[styles.originBadge, badgeStyle.container]}>
                <Ionicons name={originDisplay.icon} size={10} color={badgeStyle.iconColor} />
                <Text 
                  style={[styles.originLabel, badgeStyle.text]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {originDisplay.label}
                </Text>
              </View>
              
              <View style={styles.bondBadge}>
                <Text style={styles.bondText}>{formatBondLevel(card.bondLevel)}</Text>
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  cardBase: {
    flex: 1,
    backgroundColor: CURVAO.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CURVAO.borderGold,
    overflow: 'hidden',
    position: 'relative',
  },
  texture: {
    borderRadius: 12,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    zIndex: 20,
  },
  rarityText: {
    color: CURVAO.gold,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  clubCrest: {
    width: 26,
    height: 26,
  },
  imageContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    bottom: 20,
    zIndex: 5,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
    zIndex: 10,
  },
  bottomInfo: {
    gap: 2,
  },
  playerName: {
    color: CURVAO.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playerMeta: {
    color: CURVAO.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    maxWidth: '70%',
  },
  badgeNeutral: {
    backgroundColor: 'rgba(167, 163, 154, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(167, 163, 154, 0.2)',
  },
  badgeMint: {
    backgroundColor: 'rgba(34, 200, 120, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(34, 200, 120, 0.3)',
  },
  badgeGold: {
    backgroundColor: 'rgba(216, 170, 77, 0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(216, 170, 77, 0.3)',
  },
  originLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bondBadge: {
    backgroundColor: 'rgba(216, 170, 77, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(216, 170, 77, 0.2)',
  },
  bondText: {
    color: CURVAO.gold,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});