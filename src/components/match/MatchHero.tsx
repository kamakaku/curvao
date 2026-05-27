import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, StyleProp, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Match } from '@/src/types/models';
import {
  formatKickoffDate,
  formatKickoffTime,
  getCountdownParts,
  getMatchScoreLabel,
  getMatchViewState,
  getTeamDisplay,
} from '@/src/utils/matchUtils';

const stadiumBg = require('@/assets/cards/olympiastadion_reference.png');

type CountdownParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

type MatchHeroProps = {
  match: Match;
  variant?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
};

export function MatchHero({ match, variant = 'default', style }: MatchHeroProps) {
  const { width } = useWindowDimensions();
  const compact = variant === 'compact' || width < 390;
  const viewState = getMatchViewState(match);
  const teams = getTeamDisplay(match);
  const scoreLabel = getMatchScoreLabel(match);
  const [countdownParts, setCountdownParts] = useState<CountdownParts | undefined>(() => getCountdownParts(match));

  useEffect(() => {
    if (viewState.status !== 'upcoming') {
      setCountdownParts(undefined);
      return undefined;
    }

    const updateCountdown = () => setCountdownParts(getCountdownParts(match));
    updateCountdown();

    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [match, viewState.status]);

  const seasonLine = useMemo(() => {
    const parts = [
      match.season ? `SAISON ${match.season}` : undefined,
      match.competition ? match.competition.toUpperCase() : undefined,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [match.competition, match.season]);

  const metaItems = [
    { icon: 'location-outline' as const, label: 'STADION', value: match.expand?.stadium?.name || match.stadiumName || '—' },
    { icon: 'people-outline' as const, label: 'ATTENDANCE', value: formatAttendance(match.expand?.stadium?.capacity || match.stadiumCapacity) },
    { icon: 'partly-sunny-outline' as const, label: 'WEATHER', value: '18°C' },
  ];

  return (
    <View style={[styles.wrapper, style]}>
      <ImageBackground source={stadiumBg} style={[styles.background, compact && styles.backgroundCompact]} imageStyle={styles.backgroundImage}>
        <View style={styles.blackOverlay} />
        <LinearGradient
          colors={['rgba(8,10,9,0.76)', 'rgba(8,10,9,0.22)', 'rgba(8,10,9,0.96)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
        <TextureOverlay opacity={0.05} />

        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.heroHeader}>
            <View style={styles.verifiedBadge}>
              <Ionicons color={curvao.colors.greenBright} name="shield-checkmark-outline" size={14} />
              <Text style={styles.verifiedText}>LIGA VERIFIED</Text>
            </View>
            {seasonLine ? <Text style={styles.seasonLine}>{seasonLine}</Text> : null}
          </View>

          <View style={styles.teamsRow}>
            <TeamColumn clubId={teams.homeClubId} club={teams.homeClub} compact={compact} name={teams.homeName} />

            <View style={styles.centerBlock}>
              <Text style={[styles.vs, compact && styles.vsCompact]}>
                {viewState.status === 'final' ? 'FINAL' : scoreLabel && viewState.status === 'live' ? scoreLabel : 'VS'}
              </Text>
              <Text style={styles.kickoffLabel}>{viewState.status === 'final' ? 'ENDSTAND' : viewState.status === 'live' ? 'LIVE' : ''}</Text>
              <Text style={[styles.kickoffTime, compact && styles.kickoffTimeCompact]}>
                {viewState.status === 'final' && scoreLabel ? scoreLabel : viewState.status === 'live' ? 'LIVE' : formatKickoffTime(match)}
              </Text>
              <Text style={styles.kickoffDate}>{formatKickoffDate(match)}</Text>
            </View>

            <TeamColumn clubId={teams.awayClubId} club={teams.awayClub} compact={compact} name={teams.awayName} />
          </View>

          {viewState.status !== 'final' ? <CountdownBox parts={countdownParts} scoreLabel={scoreLabel} status={viewState.status} /> : null}

          <View style={styles.metaRow}>
            {metaItems.map((item, index) => (
              <View key={item.label} style={styles.metaSlot}>
                <MetaItem icon={item.icon} label={item.label} value={item.value} />
                {index < metaItems.length - 1 ? <View style={styles.metaDivider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function TeamColumn({ clubId, club, compact, name }: { clubId?: string; club?: any; compact: boolean; name: string }) {
  return (
    <View style={styles.teamColumn}>
      <View style={[styles.crestWrap, compact && styles.crestWrapCompact]}>
        <Image resizeMode="contain" source={getClubCrestSource(club || clubId)} style={[styles.crest, compact && styles.crestCompact]} />
      </View>
      <Text numberOfLines={2} style={styles.teamName}>
        {name}
      </Text>
    </View>
  );
}

function CountdownBox({
  parts,
  scoreLabel,
  status,
}: {
  parts?: CountdownParts;
  scoreLabel?: string;
  status: 'upcoming' | 'live' | 'final' | 'archived';
}) {
  if (status === 'upcoming' && parts) {
    return (
      <View style={styles.countdownBox}>
        <Text style={styles.countdownText}>{`${parts.hours} : ${parts.minutes} : ${parts.seconds}`}</Text>
      </View>
    );
  }

  if (status === 'live') {
    return (
      <View style={styles.countdownBox}>
        <Text style={[styles.countdownText, styles.liveText]}>LIVE</Text>
      </View>
    );
  }

  if (status === 'final' && scoreLabel) {
    return (
      <View style={styles.countdownBox}>
        <Text style={styles.countdownText}>{scoreLabel}</Text>
      </View>
    );
  }

  return null;
}

function MetaItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons color={curvao.colors.gold} name={icon} size={14} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

function formatAttendance(capacity?: number) {
  if (!capacity) return '—';
  if (capacity >= 1000) return `${Math.round(capacity / 1000)}K`;
  return String(capacity);
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#080A09',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    overflow: 'hidden',
    marginTop: 16,
  },
  background: {
    minHeight: 100,
    maxHeight: 300,
  },
  backgroundCompact: {
    minHeight: 100,
    maxHeight: 324,
  },
  backgroundImage: {
    opacity: 0.24,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  content: {
    minHeight: 120,
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  contentCompact: {
    minHeight: 240,
    maxHeight: 324,
    paddingTop: 14,
    paddingBottom: 10,
  },
  heroHeader: {
    alignItems: 'center',
  },
  verifiedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  verifiedText: {
    color: curvao.colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  seasonLine: {
    color: curvao.colors.muted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    marginTop: 6,
    textAlign: 'center',
  },
  teamsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  teamColumn: {
    alignItems: 'center',
    width: 104,
  },
  crestWrap: {
    alignItems: 'center',
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  crestWrapCompact: {
    height: 56,
    width: 56,
  },
  crest: {
    height: 56,
    width: 56,
  },
  crestCompact: {
    height: 50,
    width: 50,
  },
  teamName: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 16,
    marginTop: 7,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  centerBlock: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minWidth: 92,
  },
  vs: {
    color: curvao.colors.gold,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    textShadow: '0px 4px 10px rgba(0,0,0,0.72)',
  },
  vsCompact: {
    fontSize: 28,
  },
  kickoffLabel: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginTop: 3,
  },
  kickoffTime: {
    color: curvao.colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  kickoffTimeCompact: {
    fontSize: 22,
  },
  kickoffDate: {
    color: curvao.colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  countdownBox: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(8,10,9,0.74)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    minWidth: 170,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  countdownText: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveText: {
    color: curvao.colors.greenBright,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 14,
    borderTopColor: 'rgba(216,170,77,0.18)',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  metaSlot: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  metaDivider: {
    position: 'absolute',
    right: 0,
    top: 2,
    bottom: 2,
    width: 1,
    backgroundColor: 'rgba(216,170,77,0.18)',
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  metaLabel: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  metaValue: {
    color: curvao.colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
});
