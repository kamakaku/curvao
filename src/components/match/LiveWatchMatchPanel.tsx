import { Ionicons } from '@expo/vector-icons';
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
import { type RewardResult, selectLiveWatchRewardCardTemplate } from '@/src/services/rewardEngineService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CardTemplate, LiveWatchSession, Match, UserCard } from '@/src/types/models';
import { getMatchViewState } from '@/src/utils/matchUtils';

type LiveWatchPanelState = 'loading' | 'not_available' | 'available' | 'active' | 'can_complete' | 'completed' | 'error';

type LiveWatchMatchPanelProps = {
  match: Match;
  matchId: string;
  userId?: string;
  initialAvailability?: LiveWatchAvailability;
  rewardCard?: UserCard;
  onOpenLiveWatch?: () => void;
  onOpenCollection?: () => void;
  onRewardGranted?: (result: RewardResult) => void;
};

type Countdown = {
  watchedSeconds: number;
  requiredSeconds: number;
};

export function LiveWatchMatchPanel({
  match,
  matchId,
  userId,
  initialAvailability,
  rewardCard,
  onOpenLiveWatch,
  onOpenCollection,
  onRewardGranted,
}: LiveWatchMatchPanelProps) {
  const [availability, setAvailability] = useState<LiveWatchAvailability | undefined>(initialAvailability);
  const [session, setSession] = useState<LiveWatchSession | undefined>(
    initialAvailability?.activeSession ?? initialAvailability?.completedSession ?? undefined,
  );
  const [rewardTemplate, setRewardTemplate] = useState<CardTemplate | null>(null);
  const [grantedCard, setGrantedCard] = useState<UserCard | null>(rewardCard ?? null);
  const [loading, setLoading] = useState(!initialAvailability && Boolean(userId));
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setAvailability(initialAvailability);
    setSession(initialAvailability?.activeSession ?? initialAvailability?.completedSession ?? undefined);
  }, [initialAvailability]);

  useEffect(() => {
    setGrantedCard(rewardCard ?? null);
  }, [rewardCard]);

  useEffect(() => {
    let mounted = true;

    async function loadAvailability() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(undefined);
        const result = await getLiveWatchAvailability({ userId, matchId });
        if (!mounted) return;
        setAvailability(result);
        setSession(result.activeSession ?? result.completedSession ?? undefined);
      } catch {
        if (!mounted) return;
        setError('Live Watch konnte nicht geprüft werden.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!initialAvailability) {
      loadAvailability();
    }

    return () => {
      mounted = false;
    };
  }, [initialAvailability, matchId, userId]);

  useEffect(() => {
    let mounted = true;

    selectLiveWatchRewardCardTemplate({ matchId, userId: userId ?? '' })
      .then((template) => {
        if (!mounted) return;
        setRewardTemplate(template);
      })
      .catch(() => {
        if (!mounted) return;
        setRewardTemplate(null);
      });

    return () => {
      mounted = false;
    };
  }, [matchId, userId]);

  const panelState = useMemo(
    () =>
      computePanelState({
        loading,
        error,
        userId,
        availability,
        session,
        canLiveWatchByMatch: getMatchViewState(match).canLiveWatch,
      }),
    [availability, error, loading, match, session, userId],
  );

  const resolvedSession = session ?? availability?.activeSession ?? availability?.completedSession ?? undefined;
  const progress = useMemo(() => {
    const watchedSeconds = resolvedSession?.watchedSeconds ?? 0;
    const requiredSeconds = resolvedSession?.requiredSeconds ?? LIVE_WATCH_REQUIRED_SECONDS;
    const safeRequired = requiredSeconds > 0 ? requiredSeconds : 1;
    return {
      watchedSeconds,
      requiredSeconds: safeRequired,
      percent: Math.min(1, watchedSeconds / safeRequired),
    };
  }, [resolvedSession]);

  const status = getStatusDescriptor(panelState);
  const bodyCopy = getBodyCopy(panelState, availability?.reason);
  const primary = getPrimaryAction(panelState, Boolean(onOpenLiveWatch));

  async function refreshAvailability() {
    if (!userId) return;
    const result = await getLiveWatchAvailability({ userId, matchId });
    setAvailability(result);
    setSession(result.activeSession ?? result.completedSession ?? undefined);
  }

  async function handlePrimaryPress() {
    if (!userId || working || !primary.enabled) return;

    if (panelState === 'available') {
      setWorking(true);
      setError(undefined);
      try {
        const started = await startLiveWatchSession({ userId, matchId });
        setSession(started);
        await refreshAvailability();
        onOpenLiveWatch?.();
      } catch {
        setError('Live Watch konnte nicht gestartet werden.');
      } finally {
        setWorking(false);
      }
      return;
    }

    if (panelState === 'active') {
      onOpenLiveWatch?.();
      return;
    }

    if (panelState === 'can_complete' && resolvedSession) {
      setWorking(true);
      setError(undefined);
      try {
        const completion = await completeLiveWatchSession({ sessionId: resolvedSession.id, userId });
        setSession(completion.session);
        await refreshAvailability();
        onRewardGranted?.({
          granted: true,
          message: 'Reward Package erstellt.',
        });
      } catch {
        setError('Reward konnte nicht gesichert werden.');
      } finally {
        setWorking(false);
      }
      return;
    }

    if (panelState === 'completed') {
      onOpenCollection?.();
    }
  }

  return (
    <View style={styles.panel}>
      <TextureOverlay opacity={0.05} />

      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.iconCircle}>
            <Ionicons color={curvao.colors.gold} name="tv-outline" size={21} />
          </View>
          <View style={styles.titleCopy}>
            <Text style={styles.title}>LIVE WATCH</Text>
            <Text style={styles.subtitle}>Schau das Spiel live und sichere dir exklusive Rewards.</Text>
          </View>
        </View>
        <View style={[styles.badge, status.badgeStyle]}>
          <Text style={[styles.badgeText, status.textStyle]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.stateText}>{bodyCopy}</Text>

      <View style={styles.rewardBox}>
        <Text style={styles.rewardKicker}>MÖGLICHER REWARD</Text>
        <View style={styles.rewardPreviewRow}>
          <View style={styles.rewardIconWrap}>
            <Ionicons color={curvao.colors.gold} name="albums-outline" size={24} />
          </View>
          <View style={styles.rewardTextWrap}>
            <Text style={styles.rewardTitle}>{grantedCard?.title ?? rewardTemplate?.name ?? 'MatchCard'}</Text>
            <Text style={styles.rewardSubtitle}>{rewardTemplate || grantedCard ? 'Live Verified' : 'Reward wird vorbereitet'}</Text>
            <Text style={styles.rewardXp}>+100 XP</Text>
          </View>
        </View>
      </View>


      {(panelState === 'active' || panelState === 'can_complete') ? (
        <ProgressBlock countdown={progress} isComplete={panelState === 'can_complete'} />
      ) : null}

      {panelState === 'completed' ? (
        <View style={styles.completedNote}>
          <Ionicons color={curvao.colors.greenBright} name="checkmark-circle-outline" size={16} />
          <Text style={styles.completedText}>Live Watch abgeschlossen. Dein Reward wurde gesichert.</Text>
        </View>
      ) : null}

      {error ? (
        <Pressable onPress={() => { void refreshAvailability(); }} style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorRetry}>Erneut prüfen</Text>
        </Pressable>
      ) : null}

      <Pressable
        disabled={!primary.enabled || working}
        onPress={() => { void handlePrimaryPress(); }}
        style={[styles.primaryButton, (!primary.enabled || working) && styles.primaryButtonDisabled]}>
        <Text style={[styles.primaryText, (!primary.enabled || working) && styles.primaryTextDisabled]}>
          {working ? primary.loadingLabel : primary.label}
        </Text>
        <Ionicons
          color={(!primary.enabled || working) ? curvao.colors.muted : curvao.colors.textInverted}
          name={primary.icon}
          size={16}
        />
      </Pressable>

      {panelState === 'completed' && onOpenCollection ? (
        <Pressable onPress={onOpenCollection} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>ZUR SAMMLUNG</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProgressBlock({ countdown, isComplete }: { countdown: Countdown & { percent: number }; isComplete: boolean }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTop}>
        <Text style={styles.progressLabel}>FORTSCHRITT</Text>
        <Text style={styles.progressPct}>{Math.round(countdown.percent * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, isComplete && styles.fillComplete, { width: `${countdown.percent * 100}%` }]} />
      </View>
      <Text style={styles.progressDuration}>{formatWatchDuration(countdown.watchedSeconds)} / {formatWatchDuration(countdown.requiredSeconds)}</Text>
    </View>
  );
}

function getStatusDescriptor(state: LiveWatchPanelState) {
  if (state === 'available') return { label: 'VERFÜGBAR', badgeStyle: styles.badgeGold, textStyle: styles.badgeGoldText };
  if (state === 'active') return { label: 'LÄUFT', badgeStyle: styles.badgeMint, textStyle: styles.badgeMintText };
  if (state === 'can_complete') return { label: 'REWARD BEREIT', badgeStyle: styles.badgeMint, textStyle: styles.badgeMintText };
  if (state === 'completed') return { label: 'ABGESCHLOSSEN', badgeStyle: styles.badgeMint, textStyle: styles.badgeMintText };
  if (state === 'loading') return { label: 'PRÜFT', badgeStyle: styles.badgeMuted, textStyle: styles.badgeMutedText };
  if (state === 'error') return { label: 'NICHT VERFÜGBAR', badgeStyle: styles.badgeMuted, textStyle: styles.badgeMutedText };
  return { label: 'AM MATCHDAY', badgeStyle: styles.badgeMuted, textStyle: styles.badgeMutedText };
}

function getPrimaryAction(state: LiveWatchPanelState, hasLiveWatchRoute: boolean) {
  if (state === 'available') return { enabled: true, label: 'LIVE WATCH STARTEN', loadingLabel: 'STARTE…', icon: 'play-circle-outline' as const };
  if (state === 'active') return { enabled: hasLiveWatchRoute, label: 'LIVE WATCH FORTSETZEN', loadingLabel: 'ÖFFNET…', icon: 'chevron-forward' as const };
  if (state === 'can_complete') return { enabled: true, label: 'REWARD SICHERN', loadingLabel: 'REWARD WIRD GESICHERT…', icon: 'shield-checkmark-outline' as const };
  if (state === 'completed') return { enabled: true, label: 'ZUR CARD', loadingLabel: 'ÖFFNET…', icon: 'albums-outline' as const };
  if (state === 'loading') return { enabled: false, label: 'LIVE WATCH WIRD GEPRÜFT', loadingLabel: 'PRÜFT…', icon: 'hourglass-outline' as const };
  if (state === 'error') return { enabled: false, label: 'NICHT VERFÜGBAR', loadingLabel: 'PRÜFT…', icon: 'lock-closed-outline' as const };
  return { enabled: false, label: 'AM MATCHDAY VERFÜGBAR', loadingLabel: 'PRÜFT…', icon: 'lock-closed-outline' as const };
}

function getBodyCopy(state: LiveWatchPanelState, fallbackReason?: string) {
  if (state === 'loading') return 'Live Watch wird geprüft…';
  if (state === 'available') return 'Starte Live Watch und bleib aktiv, um deinen Matchday Reward zu sichern.';
  if (state === 'active') return 'Live Watch läuft. Bleib aktiv, um deinen Reward zu sichern.';
  if (state === 'can_complete') return 'Du hast die Mindestzeit erreicht. Sichere dir deinen Reward.';
  if (state === 'completed') return 'Live Watch abgeschlossen. Dein Reward wurde gesichert.';
  if (state === 'error') return 'Live Watch konnte aktuell nicht geprüft werden.';
  return fallbackReason ?? 'Live Watch ist am Matchday verfügbar.';
}

function computePanelState(input: {
  loading: boolean;
  error?: string;
  userId?: string;
  availability?: LiveWatchAvailability;
  session?: LiveWatchSession;
  canLiveWatchByMatch: boolean;
}): LiveWatchPanelState {
  if (input.loading) return 'loading';
  if (input.error) return 'error';
  if (!input.userId) return 'not_available';

  const activeSession = input.session ?? input.availability?.activeSession ?? undefined;
  const completedSession = input.availability?.completedSession ?? undefined;

  if (input.availability?.alreadyRewarded || completedSession?.rewardClaimed) return 'completed';

  if (activeSession?.status === 'active') {
    if (activeSession.watchedSeconds >= activeSession.requiredSeconds || input.availability?.canComplete) {
      return 'can_complete';
    }
    return 'active';
  }

  if (input.availability?.canComplete) return 'can_complete';
  if (input.availability?.canResume) return 'active';
  if (input.availability?.canStart || input.canLiveWatchByMatch) return 'available';
  return 'not_available';
}

function formatWatchDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  if (safe < 90) return `${safe} Sek.`;
  const minutes = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${minutes}:${String(sec).padStart(2, '0')} Min.`;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(18,22,20,0.90)',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    padding: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitleWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.24)',
    backgroundColor: 'rgba(216,170,77,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCopy: {
    flex: 1,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeGold: {
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.28)',
  },
  badgeMint: {
    backgroundColor: 'rgba(34,200,120,0.12)',
    borderColor: 'rgba(34,200,120,0.34)',
  },
  badgeMuted: {
    backgroundColor: 'rgba(167,163,154,0.08)',
    borderColor: 'rgba(167,163,154,0.20)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  badgeGoldText: {
    color: curvao.colors.gold,
  },
  badgeMintText: {
    color: curvao.colors.greenBright,
  },
  badgeMutedText: {
    color: curvao.colors.muted,
  },
  stateText: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  rewardBox: {
    backgroundColor: 'rgba(7,9,8,0.56)',
    borderColor: 'rgba(216,170,77,0.14)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  rewardKicker: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  rewardPreviewRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  rewardIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.24)',
    backgroundColor: 'rgba(216,170,77,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardTextWrap: {
    flex: 1,
  },
  rewardTitle: {
    color: curvao.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  rewardSubtitle: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  rewardXp: {
    color: curvao.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  rulesBox: {
    backgroundColor: 'rgba(7,9,8,0.38)',
    borderColor: 'rgba(216,170,77,0.12)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  ruleLabel: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  ruleValue: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  progressWrap: {
    gap: 8,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  progressPct: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: curvao.colors.gold,
  },
  fillComplete: {
    backgroundColor: curvao.colors.greenBright,
  },
  progressDuration: {
    color: curvao.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  completedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(34,200,120,0.22)',
    backgroundColor: 'rgba(34,200,120,0.08)',
    padding: 12,
  },
  completedText: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  errorBox: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(205,87,77,0.28)',
    backgroundColor: 'rgba(205,87,77,0.10)',
    padding: 12,
    gap: 3,
  },
  errorText: {
    color: '#F28B82',
    fontSize: 12,
    fontWeight: '800',
  },
  errorRetry: {
    color: curvao.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  primaryButton: {
    backgroundColor: curvao.colors.gold,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(167,163,154,0.10)',
    borderColor: 'rgba(167,163,154,0.18)',
    borderWidth: 1,
  },
  primaryText: {
    color: curvao.colors.textInverted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  primaryTextDisabled: {
    color: curvao.colors.muted,
  },
  secondaryButton: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.28)',
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryText: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
