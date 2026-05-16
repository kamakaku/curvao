import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource, getPlayerImageSource } from '@/src/services/cardAssetService';
import { formatRarity } from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CardOrigin, Rarity, UserCard, Player, Club } from '@/src/types/models';

const stadiumBackgroundSource = require('@/assets/cards/player_standard_v2_bg.png');

const ARTIFACT_STYLE = {
  surface: '#121614',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  textPrimary: '#F4F1E8',
  textMuted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
  verifiedMint: '#22C878',
};

type PlayerCardPreviewProps = {
  card: UserCard;
  player: Player;
  club: Club;
};

export function PlayerCardPreview({ card, player, club }: PlayerCardPreviewProps) {
  const playerImage = getPlayerImageSource(player.id);
  const clubCrest = getClubCrestSource(club.id);

  const renderOriginIcon = () => {
    let iconName: keyof typeof Ionicons.glyphMap = 'card-outline';
    let label = 'CLAIMED';

    switch (card.origin) {
      case 'stadium_verified':
        iconName = 'shield-checkmark-outline';
        label = 'STADIUM';
        break;
      case 'logged_viewing':
        iconName = 'tv-outline';
        label = 'LIVE';
        break;
      case 'self_earned':
        iconName = 'archive-outline';
        label = 'CLAIMED';
        break;
      case 'club_drop':
      case 'event_drop':
        iconName = 'albums-outline';
        label = 'PACK';
        break;
    }

    return (
      <View style={styles.originBadge}>
        <Ionicons name={iconName} size={10} color={ARTIFACT_STYLE.verifiedMint} />
        <Text style={styles.originLabel}>{label}</Text>
      </View>
    );
  };

  const renderStars = (rarity: Rarity) => {
    const stars = rarity === 'standard' ? 1 : rarity === 'rare' ? 2 : rarity === 'epic' ? 3 : 5;
    return (
      <View style={styles.starsRow}>
        {[...Array(3)].map((_, i) => (
          <Ionicons 
            key={i} 
            name={i < stars ? "star" : "star-outline"} 
            size={8} 
            color={ARTIFACT_STYLE.gold} 
          />
        ))}
      </View>
    );
  };

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
          colors={['transparent', 'rgba(8, 10, 9, 0.8)', 'rgba(8, 10, 9, 1)']}
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
              {renderOriginIcon()}
              {card.bondLevel > 0 && (
                <View style={styles.bondBadge}>
                  <Text style={styles.bondText}>BOND {card.bondLevel}</Text>
                </View>
              )}
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
    aspectRatio: 0.7, // Classic card ratio
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  cardBase: {
    flex: 1,
    backgroundColor: ARTIFACT_STYLE.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ARTIFACT_STYLE.borderGold,
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
    padding: 8,
    zIndex: 20,
  },
  rarityText: {
    color: ARTIFACT_STYLE.gold,
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
    width: 24,
    height: 24,
  },
  imageContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    bottom: 0,
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
    height: '50%',
    justifyContent: 'flex-end',
    padding: 10,
    zIndex: 10,
  },
  bottomInfo: {
    gap: 2,
  },
  playerName: {
    color: ARTIFACT_STYLE.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playerMeta: {
    color: ARTIFACT_STYLE.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    letterSpacing: 0.5,
  },
  bondBadge: {
    backgroundColor: 'rgba(216, 170, 77, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bondText: {
    color: ARTIFACT_STYLE.gold,
    fontSize: 7,
    fontWeight: '900',
  },
});
