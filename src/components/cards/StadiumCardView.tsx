import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, LinearGradient, Path, Stop } from 'react-native-svg';

import { ClubCrest } from '@/src/components/cards/ClubCrest';
import { PlayerStandardFrameSvg } from '@/src/components/cards/PlayerStandardFrameSvg';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { getCardRelations } from '@/src/services/cardTemplateService';
import { getPocketBaseFileUrl } from '@/src/services/pocketbase';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const olympiastadionImage = require('@/assets/cards/olympiastadion_reference.png');

const STADIUM_INNER_BORDER_PATH =
  'M202.834 32H493.206H499.794H790.166L806.167 48.2849H908.291L961 101.9293V1294.08L901.702 1354.43H593.918L561.916 1387H498.853H494.147H431.084L399.082 1354.43H91.2979L32 1294.08V101.9293L84.7092 48.2849H186.833L202.834 32Z';

function formatVisitDate(value?: string) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('de-DE');
}

function formatNumber(value?: number) {
  return typeof value === 'number' ? value.toLocaleString('de-DE') : '—';
}

function formatStadiumDisplayName(name: string, city: string) {
  const normalizedCity = city.trim();

  if (!normalizedCity) {
    return name;
  }

  return name.replace(new RegExp(`\\s+${normalizedCity}$`, 'i'), '').trim();
}

export function StadiumCardView({ card, compact }: { card: UserCard; compact?: boolean }) {
  const { match, stadium, stadiumClub, homeClub } = getCardRelations(card);
  const stadiumName = stadium?.name ?? card.stadiumName ?? match?.stadiumName ?? card.title;
  const city = stadium?.city ?? card.stadiumCity ?? match?.stadiumCity ?? card.subtitle ?? stadiumClub?.city ?? 'Berlin';
  const displayStadiumName = formatStadiumDisplayName(stadiumName, city);
  const club = stadiumClub ?? homeClub;
  const clubName = club?.name ?? card.subtitle ?? 'Curvao Club';
  const firstVisit = formatVisitDate(card.acquiredAt);
  const visits = card.stadiumVisitCount ?? match?.stadiumVisitCount;
  const capacity = stadium?.capacity ?? card.stadiumCapacity ?? match?.stadiumCapacity;
  const isFavoriteStadium = card.favoriteStadium ?? match?.favoriteStadium;
  const crestUrl = getPocketBaseFileUrl(club, club?.crest);
  const crestSource: ImageSourcePropType | undefined = crestUrl ? { uri: crestUrl } : getClubCrestSource(club?.id);
  const stadiumImageUrl =
    getPocketBaseFileUrl(stadium, stadium?.image) ??
    getPocketBaseFileUrl(card, card.stadiumImage) ??
    getPocketBaseFileUrl(match, match?.stadiumImage);
  const stadiumImageSource: ImageSourcePropType = stadiumImageUrl ? { uri: stadiumImageUrl } : olympiastadionImage;
  const showDetails = !compact;

  const backgroundClipId = `stadiumCardBackgroundClip-${card.id}-${card.rarity}`;
  const backgroundOverlayId = `stadiumCardBackgroundOverlay-${card.id}-${card.rarity}`;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.cardClippedContent, compact && styles.cardClippedContentCompact]}>
        <View pointerEvents="none" style={styles.stadiumBackgroundImage}>
          <Svg height="100%" viewBox="0 0 992 1419.5" width="100%">
            <Defs>
              <ClipPath id={backgroundClipId}>
                <Path d={STADIUM_INNER_BORDER_PATH} />
              </ClipPath>
              <LinearGradient gradientUnits="userSpaceOnUse" id={backgroundOverlayId} x1="0" x2="0" y1="32" y2="1387">
                <Stop offset="0" stopColor="#000000" stopOpacity="1" />
                <Stop offset="0.3" stopColor="#000000" stopOpacity="0.5" />
                <Stop offset="0.5" stopColor="#000000" stopOpacity="0" />
                <Stop offset="0.6" stopColor="#000000" stopOpacity="0.5" />
                <Stop offset="1" stopColor="#000000" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <SvgImage
              clipPath={`url(#${backgroundClipId})`}
              height="1419.5"
              href={stadiumImageSource}
              preserveAspectRatio="xMidYMid slice"
              width="992"
              x="0"
              y="0"
            />
            <Path d={STADIUM_INNER_BORDER_PATH} fill={`url(#${backgroundOverlayId})`} />
          </Svg>
        </View>

        <View style={[styles.titleBlock, compact && styles.titleBlockCompact]}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.stadiumName, compact && styles.stadiumNameCompact]}>
            {displayStadiumName.toUpperCase()}
          </Text>
          <Text numberOfLines={1} style={[styles.city, compact && styles.cityCompact]}>
            {city.toUpperCase()}
          </Text>
        </View>

        <View style={[styles.clubBlock, compact && styles.clubBlockCompact]}>
          {showDetails ? <ClubCrest size={46} source={crestSource} /> : null}
          <Text numberOfLines={1} style={[styles.clubName, compact && styles.clubNameCompact]}>
            {clubName.toUpperCase()}
          </Text>
        </View>
        {showDetails ? <View style={styles.clubDivider} /> : null}

        <View style={[styles.statsRow, compact && styles.statsRowCompact]}>
          <StadiumStat compact={compact} icon="calendar-outline" label="ERSTER BESUCH" value={firstVisit} />
          {showDetails ? (
            <>
              <View style={styles.statDivider} />
              <StadiumStat icon="checkmark-circle-outline" label="BESUCHE" value={formatNumber(visits)} />
              {isFavoriteStadium ? (
                <>
                  <View style={styles.statDivider} />
                  <StadiumStat icon="shield-checkmark-outline" label="LIEBLINGSSTADION" value="" />
                </>
              ) : null}
            </>
          ) : null}
        </View>

        {showDetails ? (
          <View style={styles.capacity}>
            <Text style={styles.capacityLabel}>KAPAZITÄT</Text>
            <Text style={styles.capacityValue}>{formatNumber(capacity)}</Text>
          </View>
        ) : null}
      </View>

      <View pointerEvents="none" style={styles.frame}>
        <PlayerStandardFrameSvg layer="overlay" rarity={card.rarity} />
      </View>
    </View>
  );
}

function StadiumStat({ icon, label, value, compact }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; compact?: boolean }) {
  return (
    <View style={[styles.stat, compact && styles.statCompact]}>
      <Ionicons name={icon} size={compact ? 12 : 18} color={curvao.colors.gold} />
      {value ? <Text style={[styles.statValue, compact && styles.statValueCompact]}>{value}</Text> : null}
      <Text style={[styles.statLabel, compact && styles.statLabelCompact]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 987 / 1414.5,
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'visible',
    position: 'relative',
    width: '100%',
  },
  cardCompact: {
    borderRadius: 8,
  },
  cardClippedContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardClippedContentCompact: {
    borderRadius: 8,
  },
  stadiumBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  titleBlock: {
    alignItems: 'center',
    left: '8%',
    position: 'absolute',
    right: '8%',
    top: '7%',
    zIndex: 4,
  },
  titleBlockCompact: {
    left: '10%',
    right: '10%',
    top: '10%',
  },
  stadiumName: {
    color: curvao.colors.gold,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
  },
  stadiumNameCompact: {
    fontSize: 11,
    letterSpacing: 2,
  },
  city: {
    color: curvao.colors.text,
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  cityCompact: {
    fontSize: 9,
    letterSpacing: 4,
    marginTop: 3,
  },
  clubBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center',
    left: '12%',
    position: 'absolute',
    right: '12%',
    top: '69%',
    zIndex: 4,
  },
  clubBlockCompact: {
    left: '14%',
    right: '14%',
    top: '66%',
  },
  clubName: {
    color: curvao.colors.gold,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
  },
  clubNameCompact: {
    fontSize: 10,
    letterSpacing: 2,
  },
  clubDivider: {
    backgroundColor: 'rgba(189,153,71,0.36)',
    height: 1,
    left: '20%',
    position: 'absolute',
    right: '20%',
    top: '78%',
    zIndex: 4,
  },
  statsRow: {
    alignItems: 'center',
    bottom: '8.8%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: '10%',
    position: 'absolute',
    right: '10%',
    zIndex: 4,
  },
  statsRowCompact: {
    bottom: '11%',
    justifyContent: 'center',
    left: '24%',
    right: '24%',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    minHeight: 66,
  },
  statCompact: {
    minHeight: 34,
  },
  statValue: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },
  statValueCompact: {
    fontSize: 10,
    marginTop: 3,
  },
  statLabel: {
    color: curvao.colors.text,
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  statLabelCompact: {
    fontSize: 7,
    marginTop: 1,
  },
  statDivider: {
    backgroundColor: 'rgba(189,153,71,0.5)',
    height: 54,
    width: 1,
  },
  capacity: {
    alignItems: 'center',
    bottom: '5%',
    left: '38%',
    position: 'absolute',
    right: '38%',
    zIndex: 4,
  },
  capacityLabel: {
    color: curvao.colors.text,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 2,
  },
  capacityValue: {
    color: curvao.colors.gold,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 1,
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
    zIndex: 30,
  },
});
