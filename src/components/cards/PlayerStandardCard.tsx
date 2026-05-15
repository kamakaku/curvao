import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { PlayerStandardCardBack } from '@/src/components/cards/PlayerStandardCardBack';
import { PlayerStandardBackgroundSvg } from '@/src/components/cards/PlayerStandardBackgroundSvg';
import { PlayerStandardFrameSvg } from '@/src/components/cards/PlayerStandardFrameSvg';
import { PlayerStandardLeftRailSvg } from '@/src/components/cards/PlayerStandardLeftRailSvg';
import {
  formatOrigin,
  formatRarity,
  getInitials,
} from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CardOrigin, Rarity } from '@/src/types/models';

const stadiumBackgroundSource = require('@/assets/cards/player_standard_v2_bg.png');

const LEFT_RAIL_LAYOUT = {
  background: {
    top: '3%',
    left: '1%',
    width: '25%',
    height: '43%',
  },
  content: {
    top: '2%',
    left: '4%',
    width: '17.55%',
    height: '34.1%',
    paddingTop: 8,
  },
  smallBackground: {
    top: '4%',
    left: '3.15%',
    width: '30%',
    height: '50%',
  },
  smallContent: {
    top: '0%',
    left: '6.5%',
    width: '20%',
    height: '20%',
    paddingTop: 0,
  },
} as const;

export type PlayerStandardCardProps = {
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
    editionNumber?: number;
    editionSize?: number;
    origin: CardOrigin;
    bondLevel?: number;
    archived?: boolean;
    tradable?: boolean;
    bound?: boolean;
  };
  size?: 'small' | 'medium' | 'large';
  showFooterStatus?: boolean;
};

type RarityAccent = {
  green: string;
  greenSoft: string;
  gold: string;
  goldSoft: string;
  goldShine: string;
};

const rarityAccent: Record<Rarity, RarityAccent> = {
  standard: { green: '#8fa79b', greenSoft: '#5b7368', gold: '#bd9947', goldSoft: 'rgba(189,153,71,0.55)', goldShine: '#d7b86a' },
  rare: { green: '#21ad69', greenSoft: '#1c5c3d', gold: '#bd9947', goldSoft: 'rgba(189,153,71,0.55)', goldShine: '#d7b86a' },
  epic: { green: '#8b6cf0', greenSoft: '#3b2c7a', gold: '#bd9947', goldSoft: 'rgba(189,153,71,0.55)', goldShine: '#d7b86a' },
  legendary: { green: '#d6ad4b', greenSoft: '#7c6325', gold: '#d6ad4b', goldSoft: 'rgba(214,173,75,0.55)', goldShine: '#f0c84a' },
  oneoff: { green: '#f7d66b', greenSoft: '#a8923b', gold: '#f7d66b', goldSoft: 'rgba(247,214,107,0.55)', goldShine: '#fff2a0' },
};

type Scale = {
  rarity: number;
  position: number;
  shirt: number;
  season: number;
  seasonValue: number;
  firstName: number;
  lastName: number;
  lastNameSpacing: number;
  club: number;
  vertical: number;
  statLabel: number;
  statValue: number;
  statIcon: number;
  footerLabel: number;
  footerValue: number;
  footerIcon: number;
  starSmall: number;
  starBig: number;
  statusIcon: number;
  statusText: number;
  crestSize: number;
  badgeSize: number;
};

const sizeStyles: Record<NonNullable<PlayerStandardCardProps['size']>, Scale> = {
  small: {
    rarity: 9,
    position: 8,
    shirt: 14,
    season: 6,
    seasonValue: 7,
    firstName: 9,
    lastName: 24,
    lastNameSpacing: 2,
    club: 7,
    vertical: 6,
    statLabel: 5,
    statValue: 6,
    statIcon: 9,
    footerLabel: 4,
    footerValue: 5,
    footerIcon: 10,
    starSmall: 7,
    starBig: 8,
    statusIcon: 8,
    statusText: 7,
    crestSize: 15,
    badgeSize: 14,
  },
  medium: {
    rarity: 10,
    position: 12,
    shirt: 20,
    season: 9,
    seasonValue: 10,
    firstName: 13,
    lastName: 36,
    lastNameSpacing: 4,
    club: 9,
    vertical: 8,
    statLabel: 7,
    statValue: 8,
    statIcon: 13,
    footerLabel: 7,
    footerValue: 9,
    footerIcon: 14,
    starSmall: 10,
    starBig: 12,
    statusIcon: 10,
    statusText: 8,
    crestSize: 20,
    badgeSize: 20,
  },
  large: {
    rarity: 8,
    position: 10,
    shirt: 16,
    season: 10,
    seasonValue: 10,
    firstName: 15,
    lastName: 42,
    lastNameSpacing: 8,
    club: 10,
    vertical: 8,
    statLabel: 6,
    statValue: 8,
    statIcon: 11,
    footerLabel: 8,
    footerValue: 10,
    footerIcon: 14,
    starSmall: 9,
    starBig: 10,
    statusIcon: 8,
    statusText: 7,
    crestSize: 40,
    badgeSize: 20,
  },
};

function formatPosition(position: string) {
  if (position === 'FW') return 'STURM';
  if (position === 'MF') return 'MITTE';
  if (position === 'DF') return 'DEF';
  if (position === 'GK') return 'TOR';
  return position;
}

function positionLong(position: string) {
  if (position === 'FW') return 'Links Aussen';
  if (position === 'MF') return 'Mittelfeld';
  if (position === 'DF') return 'Verteidigung';
  if (position === 'GK') return 'Torwart';
  return position;
}

function matchDate(kickoffAt?: string) {
  if (!kickoffAt) {
    return '';
  }

  return new Date(kickoffAt).toLocaleDateString('de-DE');
}

function formatVerticalMatchDate(kickoffAt?: string) {
  if (!kickoffAt) {
    return 'MATCHDAY';
  }

  return matchDate(kickoffAt);
}

function formatFrontMatchScore(match?: PlayerStandardCardProps['match']) {
  if (!match?.homeShortName || !match?.awayShortName) {
    return 'MATCHDAY';
  }

  const hasScore = typeof match.homeScore === 'number' && typeof match.awayScore === 'number';

  if (!hasScore) {
    return `${match.homeShortName}\n${match.awayShortName}`;
  }

  return `${match.homeShortName} ${match.homeScore}\n${match.awayShortName} ${match.awayScore}`;
}

function getFrontMatchScoreRows(match?: PlayerStandardCardProps['match']) {
  if (!match?.homeShortName || !match?.awayShortName) {
    return undefined;
  }

  const hasScore = typeof match.homeScore === 'number' && typeof match.awayScore === 'number';

  if (!hasScore) {
    return [
      { team: match.homeShortName },
      { team: match.awayShortName },
    ];
  }

  return [
    { team: match.homeShortName, score: match.homeScore },
    { team: match.awayShortName, score: match.awayScore },
  ];
}

function formatOriginStacked(origin: string) {
  return origin.replace(' ', '\n');
}

const STAT_ICONS = {
  match: 'football-outline',
  position: 'grid-outline',
  traits: 'eye-outline',
  bond: 'medal-outline',
  origin: 'shield-checkmark-outline',
} as const;

function formatEditionTight(editionNumber?: number, editionSize?: number) {
  if (!editionNumber) {
    return '-';
  }

  const left = editionNumber.toString();
  if (!editionSize) {
    return left;
  }

  return `${left}/${editionSize.toLocaleString('de-DE')}`;
}

export function PlayerStandardCard({
  player,
  club,
  match,
  card,
  size = 'medium',
  showFooterStatus = true,
}: PlayerStandardCardProps) {
  const scale = sizeStyles[size];
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const showSeason = !isSmall;
  const showVerticalEarned = !isSmall;
  const showDetailedStats = !isSmall;
  const showInternalStatus = showFooterStatus && !isSmall;
  const accent = rarityAccent[card.rarity];
  const initials = getInitials(player.displayName);
  const frontMatchScore = formatFrontMatchScore(match);
  const frontMatchScoreRows = getFrontMatchScoreRows(match);
  const verticalDate = formatVerticalMatchDate(match?.kickoffAt);
  const origin = formatOrigin(card.origin);
  const playerImageSource = player.imageSource ?? (player.imageUrl ? { uri: player.imageUrl } : undefined);
  const crestSource = club.crestSource ?? (club.crestUrl ? { uri: club.crestUrl } : undefined);
  const [flipped, setFlipped] = useState(false);
  const flipProgress = useSharedValue(0);
  const canFlip = !isSmall;

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg`;

    return {
      opacity: flipProgress.value > 0.5 ? 0 : 1,
      transform: [{ perspective: 1200 }, { rotateY }],
      zIndex: flipProgress.value > 0.5 ? 0 : 2,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg`;

    return {
      opacity: flipProgress.value > 0.5 ? 1 : 0,
      transform: [{ perspective: 1200 }, { rotateY }],
      zIndex: flipProgress.value > 0.5 ? 2 : 0,
    };
  });

  function toggleFlip() {
    if (!canFlip) {
      return;
    }

    const next = !flipped;
    setFlipped(next);
    flipProgress.value = withTiming(next ? 1 : 0, { duration: 650 });
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={flipped ? 'Kartenvorderseite anzeigen' : 'Kartenrückseite anzeigen'}
        disabled={!canFlip}
        onPress={toggleFlip}
        style={[styles.flipPressable, !canFlip && styles.flipPressablePassthrough]}>
      <View style={styles.card}>
        <Animated.View style={[styles.flipFace, canFlip && frontAnimatedStyle]}>
        {/* the card background is the single full-card artwork */}
        {!isSmall ? (
          <PlayerStandardBackgroundSvg source={stadiumBackgroundSource} />
        ) : <PlayerStandardBackgroundSvg source={stadiumBackgroundSource} />}

        {/* player portrait — reliable RN Image, faded via overlay below */}
        <View style={[styles.portraitLayer, isSmall && styles.portraitLayerSmall]}>
          {playerImageSource ? (
            <Image source={playerImageSource} style={styles.playerImage} resizeMode="contain" />
          ) : (
            <View style={[styles.silhouette, { borderColor: accent.green }]}>
              <Text style={[styles.silhouetteInitials, { color: accent.green }]}>{initials || 'CV'}</Text>
              <Text style={styles.silhouetteLabel}>PLAYER IMAGE</Text>
            </View>
          )}
        </View>

        {/* subtle lower portrait fade only; the background artwork remains untouched */}
        <View style={[styles.portraitFade, isSmall && styles.portraitFadeSmall]}>
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient id="portraitFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#070807" stopOpacity="0" />
                <Stop offset="0.58" stopColor="#070807" stopOpacity="0.14" />
                <Stop offset="1" stopColor="#070807" stopOpacity="0.36" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#portraitFade)" />
          </Svg>
        </View>

        {!isSmall ? (
          <View style={styles.topRarity}>
            <Ionicons name="diamond-outline" size={scale.starBig + 8} color={accent.gold} />
            <View style={styles.topStarRow}>
              <Ionicons name="star" size={scale.starSmall + 2} color={accent.gold} />
              <Ionicons name="star" size={scale.starSmall + 2} color="rgba(189,153,71,0.35)" />
              <Ionicons name="star" size={scale.starSmall + 2} color="rgba(189,153,71,0.35)" />
            </View>
          </View>
        ) : null}

        <View style={[styles.leftRailBackground, isSmall && styles.leftRailBackgroundSmall]}>
          <PlayerStandardLeftRailSvg color={accent.green} />
        </View>

        {/* top-left rail */}
        <View style={[styles.leftRail, isSmall && styles.leftRailSmall]}>
          <View style={styles.leftRailZone}>
            <Text style={[styles.rarity, { color: accent.green, fontSize: scale.rarity }]} numberOfLines={1}>
              {isSmall ? formatRarity(card.rarity) : 'FOOT'}
            </Text>
            {isSmall ? (
              <View style={styles.starRow}>
                <Ionicons name="star" size={scale.starSmall} color={accent.gold} />
                <Ionicons name="star-outline" size={scale.starSmall} color={accent.goldSoft} />
                <Ionicons name="star-outline" size={scale.starSmall} color={accent.goldSoft} />
              </View>
            ) : (
              <Text style={[styles.leftRailFootValue, { color: accent.gold, fontSize: scale.shirt }]}>L</Text>
            )}
          </View>
          {!isSmall ? <View style={[styles.railDivider, styles.railDividerFixed, { backgroundColor: accent.goldSoft }]} /> : null}
          <View style={[styles.crest, { width: scale.crestSize, height: scale.crestSize }]}>
            {crestSource ? (
              <Image source={crestSource} style={styles.crestImage} resizeMode="contain" />
            ) : (
              <Text style={[styles.crestText, { color: accent.gold }]}>
                {club.shortName ?? getInitials(club.name)}
              </Text>
            )}
          </View>
          <View style={[styles.railDivider, styles.railDividerFixed, isSmall && styles.railDividerSmall, { backgroundColor: accent.goldSoft }]} />
          <View style={styles.leftRailZone}>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.55}
              numberOfLines={1}
              style={[styles.position, { color: accent.green, fontSize: scale.position }]}>
              {formatPosition(player.position)}
            </Text>
            <Text style={[styles.shirt, { color: accent.gold, fontSize: scale.shirt }]}>
              {player.shirtNumber ?? '-'}
            </Text>
          </View>
          {!isSmall ? (
            <>
              <View style={[styles.railDivider, styles.railDividerFixed, { backgroundColor: accent.goldSoft }]} />
              <View style={styles.flag}>
                <View style={[styles.flagStripe, { backgroundColor: '#000' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#b11523' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#ebb339' }]} />
              </View>
            </>
          ) : null}
        </View>

        {/* top-right season */}
        {showSeason ? (
          <View style={styles.topRight}>
            <Text style={[styles.seasonLabel, { color: accent.green, fontSize: scale.season }]}>SEASON</Text>
            <Text style={[styles.seasonValue, { color: accent.gold, fontSize: scale.seasonValue }]}>2025/26</Text>
          </View>
        ) : null}

        {/* right vertical match date */}
        {showVerticalEarned ? (
          <View style={styles.verticalLabel}>
            <Ionicons name="diamond-outline" size={scale.vertical + 4} color={accent.gold} />
            <View style={styles.verticalTextWrap}>
              <Text style={[styles.verticalText, { color: accent.gold, fontSize: scale.vertical }]}>
                {verticalDate}
              </Text>
            </View>
          </View>
        ) : null}

        {/* name block */}
        <View style={[styles.nameBlock, isSmall && styles.nameBlockSmall]}>
          <Text style={[styles.firstName, { color: accent.green, fontSize: scale.firstName }]} numberOfLines={1}>
            {player.firstName.toUpperCase()}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.55}
            numberOfLines={1}
            style={[
              styles.lastName,
              {
                color: accent.goldShine,
                fontSize: scale.lastName,
                letterSpacing: scale.lastNameSpacing,
                lineHeight: scale.lastName * 0.95,
              },
            ]}>
            {player.lastName.toUpperCase()}
          </Text>
          <Ionicons name="star" size={scale.starBig} color={accent.gold} style={styles.nameStar} />
          <Text style={[styles.clubName, { color: accent.green, fontSize: scale.club }]} numberOfLines={1}>
            {club.name.toUpperCase()}
          </Text>
        </View>

        {showDetailedStats ? (
          <View style={styles.statsRow}>
            {isLarge ? (
              <>
                <FullStatCell
                  icon={STAT_ICONS.match}
                  value={frontMatchScore}
                  scale={scale}
                  accent={accent}
                  scoreRows={frontMatchScoreRows}
                />
                <StatDivider color={accent.goldSoft} />
              </>
            ) : null}
            <FullStatCell
              icon={STAT_ICONS.position}
              value={positionLong(player.position)}
              scale={scale}
              accent={accent}
            />
            <StatDivider color={accent.goldSoft} />
            {isLarge ? (
              <>
                <FullStatCell icon={STAT_ICONS.traits} value="x 3" scale={scale} accent={accent} />
                <StatDivider color={accent.goldSoft} />
              </>
            ) : null}
            <FullStatCell
              icon={STAT_ICONS.bond}
              value={String(card.bondLevel ?? 1)}
              scale={scale}
              accent={accent}
            />
            <StatDivider color={accent.goldSoft} />
            <FullStatCell
              icon={STAT_ICONS.origin}
              value={formatOriginStacked(origin)}
              scale={scale}
              accent={accent}
              wide
            />
          </View>
        ) : (
          <View style={styles.compactBadges}>
            <View style={[styles.compactBadge, { borderColor: accent.goldSoft }]}>
              <Ionicons name="medal-outline" size={scale.statIcon} color={accent.gold} />
              <Text style={[styles.compactBadgeText, { color: accent.gold, fontSize: scale.statValue }]}>
                {card.bondLevel ?? 1}
              </Text>
            </View>
            <View style={[styles.compactBadge, { borderColor: accent.goldSoft }]}>
              <Ionicons name="checkmark" size={scale.statIcon} color={accent.gold} />
            </View>
          </View>
        )}

        {/* footer */}
        {isSmall ? (
          <View style={[styles.footer, styles.footerSmall]}>
            <View style={styles.footerLeft}>
              <Ionicons name="qr-code-outline" size={scale.footerIcon} color={accent.gold} />
              <Text style={[styles.footerValue, { color: accent.gold, fontSize: scale.footerValue }]} numberOfLines={1}>
                {formatEditionTight(card.editionNumber, card.editionSize)}
              </Text>
            </View>
            <View style={[styles.originBadge, { borderColor: accent.gold, width: scale.badgeSize, height: scale.badgeSize, borderRadius: scale.badgeSize / 2 }]}>
              <Ionicons name="checkmark" size={scale.badgeSize * 0.7} color={accent.gold} />
            </View>
          </View>
        ) : (
          <View style={styles.v2Footer}>
            {showInternalStatus ? (
              <View style={styles.v2StatusLeft}>
                <Ionicons name="lock-closed-outline" size={scale.statusIcon} color={curvao.colors.muted} />
                <Text style={[styles.statusText, { fontSize: scale.statusText }]}>
                  {card.archived ? 'ARCHIVED' : 'NOT ARCHIVED'}
                </Text>
              </View>
            ) : null}
            <View style={styles.v2Edition}>
              <Text style={[styles.footerValue, { color: accent.gold, fontSize: scale.footerValue }]} numberOfLines={1}>
                {formatEditionTight(card.editionNumber, card.editionSize)}
              </Text>
            </View>
            {showInternalStatus ? (
              <View style={styles.v2StatusRight}>
                <Text style={[styles.statusText, { fontSize: scale.statusText }]}>
                  {card.bound ? 'BOUND' : card.tradable ? 'TRADABLE' : 'NOT TRADABLE'}
                </Text>
                <Ionicons name="swap-horizontal" size={scale.statusIcon} color={curvao.colors.muted} />
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.frameOverlay}>
          <PlayerStandardFrameSvg layer="overlay" rarity={card.rarity} />
        </View>
        </Animated.View>
        {canFlip ? (
          <Animated.View style={[styles.flipFace, styles.flipBackFace, backAnimatedStyle]}>
            <PlayerStandardCardBack player={player} club={club} match={match} card={card} />
          </Animated.View>
        ) : null}
      </View>
      </Pressable>
    </View>
  );
}

function FullStatCell({
  icon,
  value,
  scale,
  accent,
  wide,
  scoreRows,
}: {
  icon: (typeof STAT_ICONS)[keyof typeof STAT_ICONS];
  value: string;
  scale: Scale;
  accent: RarityAccent;
  wide?: boolean;
  scoreRows?: { team: string; score?: number }[];
}) {
  return (
    <View style={[styles.stat, wide && styles.statWide]}>
      <Ionicons name={icon} size={scale.statIcon + 4} color={accent.gold} style={styles.statIcon} />
      {scoreRows ? (
        <View style={styles.scoreRows}>
          {scoreRows.map((row) => (
            <Text
              key={row.team}
              numberOfLines={1}
              style={[
                styles.statValue,
                { color: accent.gold, fontSize: scale.statValue, lineHeight: scale.statValue * 1.25 },
              ]}>
              {row.team}
              {typeof row.score === 'number' ? (
                <Text style={styles.scoreValue}> {row.score}</Text>
              ) : null}
            </Text>
          ))}
        </View>
      ) : (
        <Text
          numberOfLines={2}
          style={[
            styles.statValue,
            { color: accent.gold, fontSize: scale.statValue, lineHeight: scale.statValue * 1.25 },
          ]}>
          {value}
        </Text>
      )}
    </View>
  );
}

function StatDivider({ color }: { color: string }) {
  return <View style={[styles.statDivider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',
    position: 'relative',
    width: '100%',
  },
  flipPressable: {
    width: '100%',
    zIndex: 1,
  },
  flipPressablePassthrough: {
    pointerEvents: 'none',
  },
  card: {
    aspectRatio: 987 / 1414.5,
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'visible',
    position: 'relative',
    width: '100%',
  },
  flipFace: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
  },
  flipBackFace: {
    backgroundColor: '#06100c',
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  portraitLayer: {
    position: 'absolute',
    top: '9.5%',
    bottom: '21%',
    left: '18%',
    right: '8.5%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    zIndex: 2,
  },
  portraitLayerSmall: {
    top: '10%',
    bottom: '29%',
    left: '20%',
    right: '4%',
  },
  playerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  portraitFade: {
    position: 'absolute',
    left: '14%',
    right: '6%',
    top: '51%',
    bottom: '22%',
    zIndex: 3,
  },
  portraitFadeSmall: {
    top: '47%',
    bottom: '25%',
  },
  silhouette: {
    width: '70%',
    aspectRatio: 0.74,
    marginTop: '10%',
    backgroundColor: 'rgba(15,43,31,0.78)',
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteInitials: {
    fontSize: 34,
    fontWeight: '900',
  },
  silhouetteLabel: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 6,
  },
  leftRail: {
    position: 'absolute',
    ...LEFT_RAIL_LAYOUT.content,
    alignItems: 'center',
    zIndex: 8,
  },
  leftRailSmall: {
    ...LEFT_RAIL_LAYOUT.smallContent,
  },
  leftRailBackground: {
    position: 'absolute',
    ...LEFT_RAIL_LAYOUT.background,
    zIndex: 7,
  },
  leftRailBackgroundSmall: {
    ...LEFT_RAIL_LAYOUT.smallBackground,
  },
  rarity: {
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  leftRailFootValue: {
    fontWeight: '700',
    marginTop: 3,
    includeFontPadding: false,
  },
  leftRailZone: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    width: '100%',
  },
  starRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 0,
  },
  railDivider: {
    width: '76%',
    height: 1,
    opacity: 0.55,
    marginVertical: 2,
  },
  railDividerFixed: {
    flexShrink: 0,
  },
  railDividerSmall: {
    marginVertical: 3,
  },
  crest: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 7,
    flexShrink: 0,
  },
  crestImage: {
    width: '100%',
    height: '100%',
  },
  crestText: {
    fontWeight: '900',
    fontSize: 14,
  },
  position: {
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  shirt: {
    fontWeight: '900',
    marginTop: 4,
    includeFontPadding: false,
  },
  flag: {
    width: '40%',
    aspectRatio: 1.6,
    marginTop: 6,
    flexShrink: 0,
  },
  flagStripe: {
    flex: 1,
  },
  topRight: {
    position: 'absolute',
    top: '6.4%',
    right: '6.45%',
    alignItems: 'center',
    minWidth: '13.7%',
    zIndex: 8,
  },
  seasonLabel: {
    fontWeight: '900',
    letterSpacing: 1,
  },
  seasonValue: {
    fontWeight: '700',
    marginTop: 2,
  },
  verticalLabel: {
    position: 'absolute',
    top: '17%',
    right: '5.15%',
    width: 22,
    height: '32%',
    alignItems: 'center',
    zIndex: 8,
  },
  verticalTextWrap: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    marginTop: 20,
    overflow: 'visible',
    transform: [{ rotate: '90deg' }],
    width: 190,
  },
  verticalText: {
    fontWeight: '700',
    letterSpacing: 1.4,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
    width: 190,
  },
  nameBlock: {
    position: 'absolute',
    bottom: '21.8%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 9,
  },
  nameBlockSmall: {
    bottom: '20%',
    paddingHorizontal: 8,
  },
  firstName: {
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  lastName: {
    fontWeight: '900',
    includeFontPadding: false,
    textTransform: 'uppercase',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  nameStar: {
    marginTop: 2,
  },
  clubName: {
    fontWeight: '900',
    letterSpacing: 2.4,
    marginTop: 3,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  statsRow: {
    position: 'absolute',
    left: '8%',
    right: '7.5%',
    top: '81.4%',
    bottom: '11.8%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 0,
    gap: 4,
    zIndex: 10,
  },
  compactBadges: {
    position: 'absolute',
    bottom: '14.5%',
    left: '12%',
    right: '12%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  compactBadge: {
    minWidth: 22,
    minHeight: 18,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    backgroundColor: 'rgba(2,6,5,0.74)',
  },
  compactBadgeText: {
    fontWeight: '800',
    includeFontPadding: false,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
    gap: 3,
  },
  statWide: {
    flex: 1.25,
  },
  statLabel: {
    fontWeight: '600',
    letterSpacing: 0,
    textTransform: 'uppercase',
    textAlign: 'center',
    includeFontPadding: false,
  },
  statIcon: {
    marginBottom: 0,
  },
  statValue: {
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  scoreRows: {
    alignItems: 'center',
  },
  scoreValue: {
    color: curvao.colors.text,
  },
  statSubValue: {
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.85,
    includeFontPadding: false,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    alignSelf: 'center',
    height: '62%',
    opacity: 0.3,
  },
  footer: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: '5.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    zIndex: 10,
  },
  topRarity: {
    position: 'absolute',
    top: '5%',
    left: '42%',
    right: 0,
    gap: 10,
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 9,
  },
  topStarRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 0,
  },
  v2Footer: {
    position: 'absolute',
    left: '9%',
    right: '9%',
    bottom: '4.65%',
    minHeight: '5.8%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 11,
  },
  v2Edition: {
    position: 'absolute',
    left: '29%',
    right: '29%',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  v2StatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.5,
  },
  v2StatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    opacity: 0.5,
  },
  footerSmall: {
    left: '11%',
    right: '11%',
    bottom: '6%',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  footerRightText: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  footerValue: {
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  originBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 0,
    marginTop: -10,
    marginBottom: 10,
    opacity: 0.5,
    width: '75%',
    left: '12.5%',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: curvao.colors.text,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
