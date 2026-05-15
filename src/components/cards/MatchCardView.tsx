import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ClubCrest } from '@/src/components/cards/ClubCrest';
import { MatchCardBack } from '@/src/components/cards/MatchCardBack';
import { PlayerStandardBackgroundSvg } from '@/src/components/cards/PlayerStandardBackgroundSvg';
import { PlayerStandardFrameSvg } from '@/src/components/cards/PlayerStandardFrameSvg';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { formatEdition, formatOrigin, getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Club, UserCard } from '@/src/types/models';

const matchBackground = require('@/assets/cards/player_standard_v2_bg.png');

function formatDate(value?: string) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('de-DE');
}

function formatNumber(value?: number) {
  return typeof value === 'number' ? value.toLocaleString('de-DE') : '—';
}

function getClubLabel(club?: Club, fallback = 'CLUB') {
  return club?.name ?? club?.shortName ?? fallback;
}

function getMatchCompetitionLabel(match?: ReturnType<typeof getCardRelations>['match'], fallback?: string) {
  if (!match) {
    return fallback ?? 'Verified Match';
  }

  if (match.competition && match.season) {
    return `${match.competition} / ${match.season}`;
  }

  return match.competition ?? fallback ?? 'Verified Match';
}

function getCrestSource(club?: Club): ImageSourcePropType | undefined {
  const crestUrl = getPocketBaseFileUrl(club, club?.crest);
  return crestUrl ? { uri: crestUrl } : getClubCrestSource(club?.id);
}

function getScoreValue(value?: number) {
  return value === undefined ? '–' : String(value);
}

type MatchCardViewProps = {
  card: UserCard;
  compact?: boolean;
};

export function MatchCardView({ card, compact }: MatchCardViewProps) {
  const [flipped, setFlipped] = useState(false);
  const flipProgress = useSharedValue(0);
  const canFlip = !compact;

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

  if (!canFlip) {
    return <MatchCardFront card={card} compact={compact} />;
  }

  return (
    <Pressable
      accessibilityLabel={flipped ? 'Match-Kartenvorderseite anzeigen' : 'Match-Kartenrückseite anzeigen'}
      accessibilityRole="button"
      onPress={toggleFlip}
      style={styles.flipPressable}>
      <Animated.View style={[styles.flipFace, frontAnimatedStyle]}>
        <MatchCardFront card={card} compact={compact} />
      </Animated.View>
      <Animated.View style={[styles.flipFace, styles.flipBackFace, backAnimatedStyle]}>
        <MatchCardBack card={card} />
      </Animated.View>
    </Pressable>
  );
}

function MatchCardFront({ card, compact }: MatchCardViewProps) {
  const { match, stadium, homeClub, awayClub } = getCardRelations(card);
  const homeScore = getScoreValue(match?.homeScore);
  const awayScore = getScoreValue(match?.awayScore);
  const homeCrest = getCrestSource(homeClub);
  const awayCrest = getCrestSource(awayClub);
  const stadiumName = stadium?.name ?? match?.stadiumName ?? 'Verified Stadium';
  const stadiumCity = stadium?.city ?? match?.stadiumCity;
  const capacity = stadium?.capacity ?? match?.stadiumCapacity;
  const showDetails = !compact;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <PlayerStandardBackgroundSvg
        bottomFade
        clipId="matchCardInnerClip"
        source={matchBackground}
        topFade
      />

      <View style={[styles.header, compact && styles.headerCompact]}>
        {showDetails ? (
          <Text numberOfLines={1} style={styles.competition}>
            {getMatchCompetitionLabel(match, card.subtitle).toUpperCase()}
          </Text>
        ) : null}
        <Text style={[styles.type, compact && styles.typeCompact]}>MATCH</Text>
      </View>

      <View style={[styles.teams, compact && styles.teamsCompact]}>
        <TeamBlock club={homeClub} compact={compact} fallback="HOME" source={homeCrest} />
        <TeamBlock club={awayClub} compact={compact} fallback="AWAY" source={awayCrest} />
      </View>

      <View style={[styles.scoreBlock, compact && styles.scoreBlockCompact]}>
        <Text style={[styles.score, compact && styles.scoreCompact]}>{homeScore}</Text>
        <Text style={[styles.scoreSeparator, compact && styles.scoreSeparatorCompact]}>:</Text>
        <Text style={[styles.score, compact && styles.scoreCompact]}>{awayScore}</Text>
      </View>

      {showDetails ? (
        <View style={styles.checkinBadge}>
          <Ionicons color={curvao.colors.gold} name="shield-checkmark-outline" size={16} />
          <Text style={styles.checkinText}>{formatOrigin(card.origin) === 'STADIUM VERIFIED' ? 'ICH WAR DABEI' : formatOrigin(card.origin)}</Text>
        </View>
      ) : null}

      <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
        <MatchInfo compact={compact} icon="calendar-outline" label={formatDate(match?.kickoffAt ?? card.acquiredAt)} />
        {showDetails ? <View style={styles.infoDivider} /> : null}
        {showDetails ? <MatchInfo icon="ellipse-outline" label={`${stadiumName}${stadiumCity ? `\n${stadiumCity}` : ''}`} /> : null}
        {showDetails ? <View style={styles.infoDivider} /> : null}
        {showDetails ? <MatchInfo icon="people" label={`${formatNumber(capacity)}\nZUSCHAUER`} /> : null}
      </View>

      {showDetails ? (
        <View style={styles.edition}>
          <Text style={styles.editionLabel}>EDITION</Text>
          <Text style={styles.editionValue}>{formatEdition(card).replace('#', '#')}</Text>
        </View>
      ) : null}

      <View pointerEvents="none" style={styles.frame}>
        <PlayerStandardFrameSvg layer="overlay" rarity={card.rarity} />
      </View>
    </View>
  );
}

function TeamBlock({
  club,
  compact,
  fallback,
  source,
}: {
  club?: Club;
  compact?: boolean;
  fallback: string;
  source?: ImageSourcePropType;
}) {
  return (
    <View style={styles.team}>
      <ClubCrest size={compact ? 44 : 80} source={source} />
      <Text numberOfLines={compact ? 1 : 2} style={[styles.teamName, compact && styles.teamNameCompact]}>
        {getClubLabel(club, fallback).toUpperCase()}
      </Text>
    </View>
  );
}

function MatchInfo({ compact, icon, label }: { compact?: boolean; icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons color={curvao.colors.gold} name={icon} size={compact ? 13 : 28} />
      <Text numberOfLines={compact ? 1 : 2} style={[styles.infoLabel, compact && styles.infoLabelCompact]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flipPressable: {
    aspectRatio: 987 / 1414.5,
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
  card: {
    aspectRatio: 987 / 1414.5,
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  cardCompact: {
    borderRadius: 8,
  },
  header: {
    alignItems: 'center',
    left: '12%',
    position: 'absolute',
    right: '12%',
    top: '6.2%',
    zIndex: 4,
  },
  headerCompact: {
    top: '10%',
  },
  competition: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  type: {
    color: curvao.colors.gold,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: 9,
    textAlign: 'center',
  },
  typeCompact: {
    fontSize: 12,
    letterSpacing: 3,
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: '10%',
    position: 'absolute',
    right: '10%',
    top: '19%',
    zIndex: 4,
  },
  teamsCompact: {
    left: '12%',
    right: '12%',
    top: '25%',
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginTop: 18,
    textAlign: 'center',
  },
  teamNameCompact: {
    fontSize: 0,
    letterSpacing: 0.8,
    marginTop: -10,
  },
  scoreBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
    left: '18%',
    position: 'absolute',
    right: '18%',
    top: '38.8%',
    zIndex: 4,
  },
  scoreBlockCompact: {
    gap: 7,
    top: '45%',
  },
  score: {
    color: curvao.colors.gold,
    fontSize: 70,
    fontWeight: '900',
    lineHeight: 70,
  },
  scoreCompact: {
    fontSize: 30,
    lineHeight: 34,
  },
  scoreSeparator: {
    color: curvao.colors.text,
    fontSize: 40,
    fontWeight: '400',
    lineHeight: 40,
  },
  scoreSeparatorCompact: {
    fontSize: 22,
    lineHeight: 26,
  },
  checkinBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: curvao.colors.greenBright,
    borderRadius: 2,
    borderWidth: 1,
    bottom: '25.5%',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    zIndex: 4,
  },
  checkinText: {
    color: '#00ff6b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  infoRow: {
    alignItems: 'center',
    gap: 20,
    bottom: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: '11%',
    position: 'absolute',
    right: '11%',
    zIndex: 4,
  },
  infoRowCompact: {
    bottom: '10%',
    justifyContent: 'center',
    left: '22%',
    right: '22%',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
    minHeight: 60,
  },
  infoLabel: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  infoLabelCompact: {
    fontSize: 10,
    lineHeight: 8,
    marginTop: 4,
    color: curvao.colors.text,
  },
  infoDivider: {
    backgroundColor: 'rgba(189,153,71,0.44)',
    height: 60,
    width: 1,
  },
  edition: {
    alignItems: 'center',
    bottom: '4%',
    left: '30%',
    position: 'absolute',
    right: '30%',
    zIndex: 4,
  },
  editionLabel: {
    color: curvao.colors.text,
    fontSize: 6,
    fontWeight: '400',
    letterSpacing: 2,
  },
  editionValue: {
    color: curvao.colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
});
