import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, LinearGradient, Stop, Mask, Rect, Image as SvgImage } from 'react-native-svg';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import { PlayerLargeCardBack } from '@/src/components/cards/PlayerLargeCardBack';
import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { formatRarity, getInitials } from '@/src/services/cardTemplateService';
import type { CardOrigin, Rarity } from '@/src/types/models';

const cardBaseBlank = require('@/assets/cards/player_card_base_blank.png');
const playerPlaceholder = require('@/assets/cards/player_placholder.png');

const CURVAO = {
  surface: '#080A09',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  mint: '#22C878',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
};

const CARD_WIDTH = 340;
const CARD_HEIGHT = 488;

export type PlayerLargeCardProps = {
  player: {
    firstName: string;
    lastName: string;
    displayName: string;
    position: string;
    shirtNumber?: number;
    nationality?: string;
    imageUrl?: string;
    imageSource?: ImageSourcePropType;
  };
  club: {
    name: string;
    shortName?: string;
    crestUrl?: string;
    crestSource?: ImageSourcePropType;
    primaryColor?: string;
    secondaryColor?: string;
  };
  match?: {
    homeShortName?: string;
    awayShortName?: string;
    homeScore?: number;
    awayScore?: number;
    kickoffAt?: string;
  };
  card: {
    rarity: Rarity;
    origin: CardOrigin;
    bondLevel?: number;
    editionNumber?: number;
    editionSize?: number;
    archived?: boolean;
    tradable?: boolean;
    bound?: boolean;
    season?: string;
    seenLiveCount?: number;
    momentsCount?: number;
    acquiredAt?: string;
  };
  isFlipped?: boolean;
};

export function PlayerLargeCard(props: PlayerLargeCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = props.isFlipped !== undefined ? props.isFlipped : internalFlipped;

  return (
    <View style={styles.wrapper}>
      <Pressable 
        onPress={() => setInternalFlipped(!flipped)}
        style={styles.container}
      >
        {!flipped ? (
          <PlayerLargeCardFront {...props} />
        ) : (
          <View style={styles.backWrapper}>
            <PlayerLargeCardBack 
              player={props.player} 
              club={props.club} 
              match={props.match} 
              card={{
                ...props.card,
                bondLevel: props.card.bondLevel ?? 1,
              }} 
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}

function formatDateShort(dateString?: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function PlayerLargeCardFront({ player, club, card }: PlayerLargeCardProps) {
  const playerSource = player.imageSource ?? (player.imageUrl ? { uri: player.imageUrl } : playerPlaceholder);
  const resolvedPlayerSource = resolveAssetSource(playerSource);
  const clubCrest = club.crestSource ?? (club.crestUrl ? { uri: club.crestUrl } : undefined);
  
  const rarityLabel = formatRarity(card.rarity).toUpperCase();
  const originDisplay = getPlayerCardOriginDisplay(card.origin);
  const seasonText = card.season ?? "2025/26";
  const seenLiveText = `${card.seenLiveCount ?? 0}x`;
  const momentsText = String(card.momentsCount ?? 0);
  const acquisitionDate = formatDateShort(card.acquiredAt);
  const editionText = card.editionNumber 
    ? `#${card.editionNumber}${card.editionSize ? ` / ${card.editionSize.toLocaleString('de-DE')}` : ''}`
    : 'OPEN EDITION';

  return (
    <View style={styles.cardBase}>
      <Image source={cardBaseBlank} style={styles.backgroundImage} contentFit="fill" />
      <TextureOverlay opacity={0.15} />

      {/* Player Image with SVG MASK for absolute seamless fade-out */}
      <View style={styles.playerLayer}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="playerMaskGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="white" stopOpacity="0" />
              <Stop offset="0.15" stopColor="white" stopOpacity="1" />
              <Stop offset="0.8" stopColor="white" stopOpacity="1" />
              <Stop offset="1" stopColor="white" stopOpacity="0" />
            </LinearGradient>
            <Mask id="playerMask">
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#playerMaskGradient)" />
            </Mask>
          </Defs>
          <SvgImage
            href={resolvedPlayerSource?.uri}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid contain"
            mask="url(#playerMask)"
          />
        </Svg>
      </View>

      {/* Overlays */}
      <View style={styles.contentContainer} pointerEvents="none">
        {/* Top Left: Rarity */}
        <View style={styles.topLeft}>
          <Text style={styles.rarityLabel}>{rarityLabel}</Text>
          <RarityStars rarity={card.rarity} />
        </View>

        {/* Top Right: Season (Replaced Logo) */}
        <View style={styles.topRight}>
          <Text style={styles.seasonLabelTop}>SEASON</Text>
          <Text style={styles.seasonValueTop}>{seasonText}</Text>
        </View>

        {/* Left Info Rail */}
        <View style={styles.leftRail}>
          <Text adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={1} style={styles.shirtNumber}>
            {player.shirtNumber ?? '-'}
          </Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.positionLabel}>
            {player.position.toUpperCase()}
          </Text>
          <View style={styles.railDivider} />
          <View style={styles.crestContainer}>
            {clubCrest ? (
              <Image source={clubCrest} style={styles.clubCrest} contentFit="contain" />
            ) : (
              <Text style={styles.clubInitial}>{club.shortName ?? getInitials(club.name)}</Text>
            )}
          </View>
          <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.clubShortName}>
            {club.shortName ?? club.name.substring(0, 3).toUpperCase()}
          </Text>
        </View>

        {/* Name Block */}
        <View style={styles.nameBlock}>
          <Text 
            style={styles.lastName} 
            numberOfLines={1} 
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {player.lastName.toUpperCase()}
          </Text>
          <Text style={styles.metaSubline} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            {player.position.toUpperCase()} · {club.name.toUpperCase()}
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsDivider} />
        <View style={styles.statsRow}>
          <StatColumn icon={originDisplay.icon} label="ORIGIN" value={originDisplay.label} />
          <View style={styles.statSeparator} />
          <StatColumn icon="medal-outline" label="BOND LEVEL" value={String(card.bondLevel ?? 1)} />
          <View style={styles.statSeparator} />
          <StatColumn icon="sparkles-outline" label="MOMENTS" value={momentsText} />
          <View style={styles.statSeparator} />
          <StatColumn 
            icon="eye-outline" 
            label="SEEN LIVE" 
            value={seenLiveText} 
            valueStyle={{ color: CURVAO.mint }}
          />
        </View>
        <View style={styles.footerDivider} />
        {/* Footer: Date and Edition spread to sides */}
        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={1}>ACQUIRED ON {acquisitionDate}</Text>
          <Text style={styles.footerText} numberOfLines={1}>EDITION {editionText}</Text>
        </View>
      </View>
    </View>
  );
}

function RarityStars({ rarity }: { rarity: Rarity }) {
  const stars = rarity === 'standard' ? 1 : rarity === 'rare' ? 2 : 3;
  return (
    <View style={styles.starsRow}>
      {[...Array(3)].map((_, i) => (
        <Ionicons 
          key={i} 
          name={i < stars ? "star" : "star-outline"} 
          size={14} 
          color={CURVAO.gold} 
        />
      ))}
    </View>
  );
}

function StatColumn({ icon, label, value, valueStyle }: { icon: keyof typeof Ionicons.glyphMap, label: string, value: string, valueStyle?: any }) {
  return (
    <View style={styles.statColumn}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={14} color={CURVAO.gold} />
      </View>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>{value}</Text>
    </View>
  );
}

function getPlayerCardOriginDisplay(origin: CardOrigin): { label: string; icon: keyof typeof Ionicons.glyphMap } {
  switch (origin) {
    case 'starter_pack':
      return { label: 'STARTER', icon: 'albums-outline' };
    case 'fan_claimed':
    case 'self_earned':
      return { label: 'FAN CLAIMED', icon: 'archive-outline' };
    case 'live_verified':
    case 'logged_viewing':
      return { label: 'LIVE VERIFIED', icon: 'eye-outline' };
    case 'stadium_verified':
      return { label: 'STADIUM VERIFIED', icon: 'shield-checkmark-outline' };
    case 'special_moment':
      return { label: 'SPECIAL MOMENT', icon: 'sparkles-outline' };
    case 'club_reward':
    case 'club_drop':
    case 'event_drop':
      return { label: 'CLUB REWARD', icon: 'ribbon-outline' };
    case 'season_reward':
      return { label: 'SEASON REWARD', icon: 'trophy-outline' };
    default:
      return { label: 'COLLECTED', icon: 'checkmark-circle-outline' };
  }
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardBase: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
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
  playerLayer: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    right: '5%',
    bottom: '20%',
    zIndex: 2,
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
  seal: {
    width: '100%',
    height: '100%',
  },
  leftRail: {
    position: 'absolute',
    left: '7%',
    top: '18%',
    width: '15%',
    alignItems: 'center',
  },
  shirtNumber: {
    color: CURVAO.gold,
    fontSize: 34,
    fontWeight: '900',
  },
  positionLabel: {
    color: CURVAO.text,
    fontSize: 10,
    fontWeight: '800',
    marginTop: -2,
    opacity: 0.8,
  },
  railDivider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(216,170,77,0.3)',
    marginVertical: 12,
  },
  crestContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubCrest: {
    width: '100%',
    height: '100%',
  },
  clubInitial: {
    color: CURVAO.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  clubShortName: {
    color: CURVAO.text,
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.7,
  },
  nameBlock: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '26%',
  },
  lastName: {
    color: CURVAO.gold,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  metaSubline: {
    color: CURVAO.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -4,
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
    width: 24,
    height: 24,
    borderRadius: 8,
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
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 14,
  },
  statSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(212,175,120,0.1)',
  },
  footerDivider: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '6.5%',
    height: 1,
    backgroundColor: 'rgba(212,175,120,0.1)',
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
