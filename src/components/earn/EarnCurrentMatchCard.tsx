import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { getClubCrestSource } from '@/src/services/cardAssetService';
import { getClubName } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { LiveWatchSession, Match } from '@/src/types/models';

const stadiumBg = require('@/assets/cards/olympiastadion_reference.png');

type EarnCurrentMatchCardProps = {
  match?: Match | null;
  canLiveWatch: boolean;
  canStadiumCheckIn: boolean;
  activeLiveWatchSession?: LiveWatchSession | null;
  onLiveWatch?: () => void;
  onStadiumCheckIn?: () => void;
};

function formatKickoff(kickoffAt: string) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    weekday: 'short',
    year: 'numeric',
  }).format(new Date(kickoffAt)).replace(',', '').replace(/\./g, '.');
}

function formatWatchProgress(session: LiveWatchSession) {
  return `${formatDuration(session.watchedSeconds)} / ${formatDuration(session.requiredSeconds)}`;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function HeroActionTile({
  accent,
  disabled,
  icon,
  onPress,
  subtitle,
  title,
}: {
  accent: 'gold' | 'mint';
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  subtitle: string;
  title: string;
}) {
  const accentColor = accent === 'mint' ? '#22C878' : curvao.colors.gold;

  return (
    <Pressable disabled={disabled || !onPress} onPress={onPress} style={[styles.heroAction, disabled && styles.heroActionDisabled]}>
      <Ionicons color={accentColor} name={icon} size={18} />
      <View style={styles.heroActionCopy}>
        <Text style={styles.heroActionTitle}>{title}</Text>
        <Text style={styles.heroActionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export function EarnCurrentMatchCard({
  match,
  canLiveWatch,
  canStadiumCheckIn,
  activeLiveWatchSession,
  onLiveWatch,
  onStadiumCheckIn,
}: EarnCurrentMatchCardProps) {
  if (!match) {
    return null;
  }

  const homeName = getClubName(match.homeClub);
  const awayName = getClubName(match.awayClub);
  const liveWatchReady = Boolean(
    activeLiveWatchSession?.status === 'active' &&
    activeLiveWatchSession.watchedSeconds >= activeLiveWatchSession.requiredSeconds,
  );
  const hasActiveLiveWatch = activeLiveWatchSession?.status === 'active';

  return (
    <View style={styles.wrapper}>
      <ImageBackground source={stadiumBg} style={styles.background} imageStyle={styles.backgroundImage}>
        <LinearGradient
          colors={['rgba(8,10,9,0.92)', 'rgba(8,10,9,0.52)', 'rgba(8,10,9,0.96)']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(216,170,77,0.20)', 'transparent', 'rgba(34,200,120,0.14)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <TextureOverlay opacity={0.07} />

        <View style={styles.heroContent}>
          <View style={styles.heroTopRow}>
            <Text style={styles.kicker}>NÄCHSTES SPIEL</Text>
            <Text style={styles.todayBadge}>HEUTE</Text>
          </View>

          <View style={styles.teams}>
            <View style={styles.teamColumn}>
              <Image resizeMode="contain" source={getClubCrestSource(match.expand?.homeClub || match.homeClub)} style={styles.crest} />
              <Text numberOfLines={1} style={styles.teamName}>{homeName}</Text>
            </View>
            <Text style={styles.vs}>vs.</Text>
            <View style={styles.teamColumn}>
              <Image resizeMode="contain" source={getClubCrestSource(match.expand?.awayClub || match.awayClub)} style={styles.crest} />
              <Text numberOfLines={1} style={styles.teamName}>{awayName}</Text>
            </View>
          </View>

          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Ionicons color={curvao.colors.gold} name="calendar-sharp" size={14} />
              <Text style={styles.meta}>{formatKickoff(match.kickoffAt)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons color={curvao.colors.gold} name="location-sharp" size={14} />
              <Text style={styles.meta}>{match.stadiumName.toUpperCase()} {match.stadiumCity.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <HeroActionTile
              accent="mint"
              disabled={!canLiveWatch && !hasActiveLiveWatch}
              icon="eye-outline"
              onPress={canLiveWatch || hasActiveLiveWatch ? onLiveWatch : undefined}
              subtitle={hasActiveLiveWatch ? formatWatchProgress(activeLiveWatchSession) : 'Rewards sichern'}
              title={liveWatchReady ? 'REWARD BEREIT' : hasActiveLiveWatch ? 'LIVE WATCH LÄUFT' : 'LIVE WATCH STARTEN'}
            />
            <HeroActionTile
              accent="gold"
              disabled={!canStadiumCheckIn}
              icon="location-outline"
              onPress={canStadiumCheckIn ? onStadiumCheckIn : undefined}
              subtitle="Im Stadion einchecken"
              title="STADIUM CHECK-IN"
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(18,22,20,0.85)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 8,
    overflow: 'hidden',
    boxShadow: '0px 12px 20px rgba(0,0,0,0.35)',
  },
  background: {
    minHeight: 292,
    width: '100%',
  },
  backgroundImage: {
    opacity: 0.46,
  },
  heroContent: {
    flex: 1,
    gap: curvao.spacing.md,
    padding: curvao.spacing.lg,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 3,
  },
  todayBadge: {
    backgroundColor: 'rgba(34,200,120,0.12)',
    borderColor: 'rgba(34,200,120,0.35)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#22C878',
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1.3,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  teams: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: curvao.spacing.md,
    justifyContent: 'center',
    paddingTop: curvao.spacing.sm,
  },
  teamColumn: {
    alignItems: 'center',
    flex: 1,
    gap: curvao.spacing.sm,
  },
  crest: {
    height: 72,
    width: 72,
  },
  teamName: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  vs: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.lg,
    fontStyle: 'italic',
    fontWeight: curvao.typography.weight.black,
  },
  metaBlock: {
    gap: curvao.spacing.sm,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: curvao.spacing.sm,
  },
  meta: {
    color: curvao.colors.text,
    flex: 1,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroActions: {
    flexDirection: 'row',
    gap: curvao.spacing.md,
    marginTop: 'auto',
  },
  heroAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(7,9,8,0.76)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: curvao.spacing.sm,
    minHeight: 68,
    padding: curvao.spacing.md,
  },
  heroActionDisabled: {
    opacity: 0.52,
  },
  heroActionCopy: {
    flex: 1,
    gap: 2,
  },
  heroActionTitle: {
    color: curvao.colors.text,
    fontSize: 11,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.8,
  },
  heroActionSubtitle: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: curvao.typography.weight.bold,
  },
});
