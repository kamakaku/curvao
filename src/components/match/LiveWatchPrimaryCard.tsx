import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import {
  completeLiveWatchSession,
  getLiveWatchAvailability,
  LIVE_WATCH_REQUIRED_SECONDS,
  startLiveWatchSession,
  type LiveWatchAvailability,
} from '@/src/services/liveWatchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { LiveWatchSession } from '@/src/types/models';

type LiveWatchPrimaryCardProps = {
  matchId: string;
  userId?: string;
  initialAvailability?: LiveWatchAvailability;
  onOpenLiveWatch?: () => void;
  onOpenRewardPackage?: (packageId: string) => void;
  inGroup?: boolean;
  variant?: 'card' | 'tile';
  blocked?: boolean;
  blockedReason?: string;
};

type UiState = 'loading' | 'not_available' | 'available' | 'active' | 'other_active' | 'can_complete' | 'package_unopened' | 'completed';

export function LiveWatchPrimaryCard({
  matchId,
  userId,
  initialAvailability,
  onOpenLiveWatch,
  onOpenRewardPackage,
  inGroup = false,
  variant = 'card',
  blocked = false,
  blockedReason,
}: LiveWatchPrimaryCardProps) {
  const router = useRouter();
  const [availability, setAvailability] = useState<LiveWatchAvailability | undefined>(initialAvailability);
  const [session, setSession] = useState<LiveWatchSession | undefined>(initialAvailability?.activeSession ?? initialAvailability?.completedSession ?? undefined);
  const [loading, setLoading] = useState(!initialAvailability && Boolean(userId));
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const resolvedUserId = userId;
    async function load() {
      try {
        setLoading(true);
        const result = await getLiveWatchAvailability({ userId: resolvedUserId, matchId });
        if (!mounted) return;
        setAvailability(result);
        setSession(result.activeSession ?? result.completedSession ?? undefined);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [initialAvailability, matchId, userId]);

  const uiState = useMemo<UiState>(() => {
    if (blocked) return 'not_available';
    if (loading) return 'loading';
    if (!userId) return 'not_available';
    if (availability?.rewardPackage?.status === 'unopened') return 'package_unopened';
    if (availability?.rewardPackage?.status === 'opened' || availability?.alreadyRewarded || availability?.completedSession?.rewardClaimed) return 'completed';

    const active = session?.status === 'active' ? session : availability?.activeSession;
    if (active) {
      if (active.watchedSeconds >= active.requiredSeconds || availability?.canComplete) return 'can_complete';
      return 'active';
    }

    if (availability?.otherActiveSession) return 'other_active';

    if (availability?.canComplete) return 'can_complete';
    if (availability?.canStart) return 'available';
    return 'not_available';
  }, [availability, blocked, loading, session, userId]);

  const progress = useMemo(() => {
    const watched = session?.watchedSeconds ?? availability?.activeSession?.watchedSeconds ?? 0;
    const required = Math.max(1, session?.requiredSeconds ?? availability?.activeSession?.requiredSeconds ?? LIVE_WATCH_REQUIRED_SECONDS);
    const pct = Math.min(100, Math.round((watched / required) * 100));
    return { watched, required, pct };
  }, [availability, session]);

  async function refresh() {
    if (!userId) return;
    const result = await getLiveWatchAvailability({ userId, matchId });
    setAvailability(result);
    setSession(result.activeSession ?? result.completedSession ?? undefined);
  }

  async function onPrimary() {
    if (!userId || working) return;

    if (uiState === 'available') {
      setWorking(true);
      try {
        const started = await startLiveWatchSession({ userId, matchId });
        setSession(started);
        await refresh();
        onOpenLiveWatch?.();
      } finally {
        setWorking(false);
      }
      return;
    }

    if (uiState === 'active') {
      onOpenLiveWatch?.();
      return;
    }

    if (uiState === 'can_complete') {
      const activeId = session?.id ?? availability?.activeSession?.id;
      if (!activeId) return;
      setWorking(true);
      try {
        const completion = await completeLiveWatchSession({ sessionId: activeId, userId });
        await refresh();
        onOpenRewardPackage?.(completion.rewardPackage.id);
      } finally {
        setWorking(false);
      }
      return;
    }

    if (uiState === 'other_active' && availability?.otherActiveSession) {
      router.push({ pathname: '/live-watch/[matchId]', params: { matchId: availability.otherActiveSession.match } });
      return;
    }

    if (uiState === 'package_unopened') {
      const packageId = availability?.rewardPackage?.id;
      if (packageId) onOpenRewardPackage?.(packageId);
      return;
    }
  }

  const badge = blocked
    ? 'IM STADION'
    : uiState === 'other_active' ? 'BLOCKIERT' : uiState === 'active' ? 'LÄUFT' : uiState === 'can_complete' || uiState === 'package_unopened' ? 'REWARD WARTET' : uiState === 'completed' ? 'REWARD ERHALTEN' : uiState === 'available' ? 'VERFÜGBAR' : 'AM MATCHDAY';
  const cta = uiState === 'other_active' ? 'AKTIVE SESSION ÖFFNEN' : uiState === 'active' ? 'FORTSETZEN' : uiState === 'can_complete' || uiState === 'package_unopened' ? 'REWARD ÖFFNEN' : uiState === 'completed' ? 'ZUR SAMMLUNG' : uiState === 'available' ? 'LIVE WATCH STARTEN' : 'NICHT MEHR VERFÜGBAR';
  const tileDisabled = uiState === 'not_available' || uiState === 'completed' || loading || working;

  if (variant === 'tile') {
    return (
      <Pressable
        disabled={tileDisabled}
        onPress={() => { void onPrimary(); }}
        style={[styles.tile, tileDisabled && styles.tileDisabled]}>
        <Text numberOfLines={1} style={styles.tileTitle}>LIVE WATCH</Text>
        <Text numberOfLines={2} style={styles.tileSubtitle}>
          {blocked
            ? (blockedReason ?? 'Im Stadion brauchst du kein Live Watch')
            : uiState === 'other_active'
              ? 'Live Watch läuft bereits'
              : uiState === 'active'
                ? 'Live Watch fortsetzen'
                : uiState === 'package_unopened' || uiState === 'can_complete'
                  ? 'Reward Package öffnen'
                  : availability?.reason ?? 'Spiel live im TV oder Radio verfolgen'}
        </Text>
        <View style={styles.tileDivider} />
        <View style={styles.tileStatusRow}>
          <Ionicons
            color={blocked ? curvao.colors.gold : tileDisabled ? curvao.colors.muted : '#22C878'}
            name={uiState === 'completed' ? 'checkmark-circle' : 'ellipse'}
            size={10}
          />
          <Text numberOfLines={1} style={[styles.tileStatus, tileDisabled && styles.tileStatusDisabled]}>
            {working
              ? 'Bitte warten...'
              : blocked
                ? (blockedReason ?? 'Im Stadion eingecheckt')
                : uiState === 'other_active' ? 'Anderes Spiel aktiv' : uiState === 'active' ? 'Session läuft' : uiState === 'can_complete' || uiState === 'package_unopened' ? 'Reward öffnen' : uiState === 'completed' ? 'Reward erhalten' : availability?.reason ?? 'Belohnung sichern'}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, inGroup && styles.cardInGroup]}>
      <TextureOverlay opacity={0.04} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>LIVE WATCH</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
      </View>

      <Text numberOfLines={1} style={styles.subtitle}>
        {blocked ? (blockedReason ?? 'Im Stadion eingecheckt.') : uiState === 'other_active' ? 'Du verfolgst gerade ein anderes Spiel.' : availability?.reason ?? 'Spiel live verfolgen und Reward sichern.'}
      </Text>

      <View style={styles.mainRow}>
        <View style={styles.rewardMini}>
          <Text style={styles.kicker}>MÖGLICHER REWARD</Text>
          <Text style={styles.rewardTitle}>MatchCard</Text>
          <Text style={styles.rewardSub}>+100 XP</Text>
        </View>
      </View>

      {uiState === 'active' ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress.pct}%` }]} /></View>
          <Text style={styles.progressText}>{formatWatchDuration(progress.watched)} / {formatWatchDuration(progress.required)}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={uiState === 'not_available' || uiState === 'completed' || loading || working}
        onPress={() => { void onPrimary(); }}
        style={[styles.button, (uiState === 'not_available' || uiState === 'completed' || loading || working) && styles.buttonDisabled]}>
        <Text style={[styles.buttonText, (uiState === 'not_available' || uiState === 'completed' || loading || working) && styles.buttonTextDisabled]}>{working ? 'BITTE WARTEN…' : (uiState === 'not_available' && availability?.reason ? availability.reason.toUpperCase() : cta)}</Text>
      </Pressable>
    </View>
  );
}

function formatWatchDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18,22,20,0.9)',
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 198,
    maxHeight: 230,
    overflow: 'hidden',
    padding: 16,
  },
  cardInGroup: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    maxHeight: undefined,
    minHeight: 188,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(216,170,77,0.12)',
    borderColor: 'rgba(216,170,77,0.3)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  badgeText: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  mainRow: {
    marginTop: 10,
  },
  rewardMini: {
    backgroundColor: 'rgba(7,9,8,0.55)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 72,
    padding: 10,
  },
  kicker: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rewardTitle: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  rewardSub: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  progressWrap: {
    marginTop: 8,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: curvao.colors.gold,
    height: '100%',
  },
  progressText: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'right',
  },
  button: {
    alignItems: 'center',
    backgroundColor: curvao.colors.gold,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(167,163,154,0.16)',
    borderColor: 'rgba(167,163,154,0.22)',
    borderWidth: 1,
  },
  buttonText: {
    color: curvao.colors.textInverted,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  buttonTextDisabled: {
    color: curvao.colors.muted,
  },
  tile: {
    backgroundColor: 'rgba(8,22,14,0.94)',
    borderColor: 'rgba(34,200,120,0.24)',
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minHeight: 80,
    overflow: 'hidden',
    padding: 14,
  },
  tileDisabled: {
    opacity: 0.72,
  },
  tileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tileActionTitle: {
    color: curvao.colors.gold,
    flex: 1,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginRight: 10,
  },
  tileActionTitleDisabled: {
    color: curvao.colors.muted,
  },
  tileBadge: {
    color: curvao.colors.gold,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  tileTitle: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  tileSubtitle: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
    minHeight: 34,
  },
  tileDivider: {
    backgroundColor: 'rgba(34,200,120,0.12)',
    height: 1,
    marginTop: 'auto',
    marginBottom: 10,
  },
  tileStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tileStatus: {
    color: '#22C878',
    flex: 1,
    fontSize: 8,
    fontWeight: '700',
  },
  tileStatusDisabled: {
    color: curvao.colors.muted,
  },
});
