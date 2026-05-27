import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { createCheckin } from '@/src/services/checkinService';
import { getRewardPackageForMatch, type RewardPackage } from '@/src/services/rewardPackageService';
import { 
  cancelLiveWatchSession,
  getLiveWatchSessionForMatch,
  heartbeatLiveWatchSession,
  completeLiveWatchSession,
  startLiveWatchSession,
} from '@/src/services/liveWatchService';
import { selectLiveWatchRewardCardTemplate } from '@/src/services/rewardEngineService';
import { useAuth } from '@/src/providers/AuthProvider';
import type { CardTemplate, LiveWatchSession } from '@/src/types/models';

const CURVAO_DESIGN = {
  bg: '#080A09',
  surface: '#121614',
  gold: '#D8AA4D',
  mint: '#22C878',
  text: '#F4F1E8',
  muted: '#A7A39A',
  danger: '#b8574d',
};

const backgroundSource = require('@/assets/bg_1.png');

export default function LiveWatchScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useAuth();
  
  const [session, setSession] = useState<LiveWatchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const [rewardTemplate, setRewardTemplate] = useState<CardTemplate | null>(null);
  const [rewardPackage, setRewardPackage] = useState<RewardPackage | null>(null);
  const [displayWatchedSeconds, setDisplayWatchedSeconds] = useState(0);
  
  const appState = useRef(AppState.currentState);
  const sessionRef = useRef<LiveWatchSession | null>(null);

  const fetchSession = useCallback(async () => {
    if (!user || !matchId) {
      setLoading(false);
      setError('Live Watch benötigt einen angemeldeten User und ein Match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [s, nextPackage] = await Promise.all([
        getLiveWatchSessionForMatch({ userId: user.id, matchId }),
        getRewardPackageForMatch({ userId: user.id, matchId, sourceType: 'live_watch' }).catch(() => null),
      ]);
      setRewardPackage(nextPackage);
      if (s && s.status === 'active') {
        setSession(s);
      } else {
        setSession(null);
      }
    } catch {
      setError('Live Watch konnte nicht geladen werden. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }, [matchId, user]);

  const heartbeat = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession || !user) return;
    try {
      const updatedSession = await heartbeatLiveWatchSession({ sessionId: currentSession.id, userId: user.id });
      setSession(updatedSession);
    } catch {
      // noop: transient heartbeat errors should not break the screen
    }
  }, [user]);

  useEffect(() => {
    sessionRef.current = session;
    setDisplayWatchedSeconds(session?.watchedSeconds ?? 0);
  }, [session]);

  useEffect(() => {
    let mounted = true;

    if (!matchId || !user?.id) {
      setRewardTemplate(null);
      return undefined;
    }

    selectLiveWatchRewardCardTemplate({ matchId, userId: user.id })
      .then((template) => {
        if (mounted) setRewardTemplate(template);
      })
      .catch(() => {
        if (mounted) setRewardTemplate(null);
      });

    return () => {
      mounted = false;
    };
  }, [matchId, user?.id]);

  useEffect(() => {
    fetchSession();
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Send heartbeat when app comes to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        sessionRef.current
      ) {
        heartbeat();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [fetchSession, heartbeat]);

  // Heartbeat interval
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      heartbeat();
    }, 15000); // every 15 seconds
    return () => clearInterval(interval);
  }, [heartbeat, session]);

  useEffect(() => {
    if (!session || session.status !== 'active') return undefined;

    const interval = setInterval(() => {
      setDisplayWatchedSeconds((current) => Math.min(session.requiredSeconds, current + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleComplete = async () => {
    if (!session || !user) return;
    try {
      const completion = await completeLiveWatchSession({ sessionId: session.id, userId: user.id });
      setRewardPackage(completion.rewardPackage);
      setSession(completion.session);
      router.push({ pathname: '/reward-package/[id]', params: { id: completion.rewardPackage.id } });
    } catch(err: any) {
      setError(err.message || "Abschließen fehlgeschlagen.");
    }
  };

  const handleStart = async () => {
    if (!user || !matchId) return;
    setStarting(true);
    setError(null);
    try {
      const newSession = await startLiveWatchSession({ userId: user.id, matchId });
      setSession(newSession);
    } catch {
      setError('Live Watch konnte nicht gestartet werden.');
    } finally {
      setStarting(false);
    }
  };

  const handleCancel = async () => {
    if (!session || !user) return;
    setError(null);
    try {
      await cancelLiveWatchSession({ sessionId: session.id, userId: user.id });
      setSession(null);
      setDisplayWatchedSeconds(0);
    } catch {
      setError('Live Watch konnte nicht abgebrochen werden.');
    }
  };

  const handleStadiumCheckIn = async () => {
    if (!matchId || !user || checkingIn) return;
    setCheckingIn(true);
    setCheckinMessage(null);
    try {
      await createCheckin(user.id, matchId, 'stadium');
      setCheckinMessage('Check-in gespeichert. Reward nach dem Spiel.');
    } catch (err: any) {
      setError(err.message || 'Stadium Check-in konnte nicht gespeichert werden.');
    } finally {
      setCheckingIn(false);
    }
  };

  const goMatchHub = () => {
    if (matchId) {
      router.replace(`/matches/${matchId}`);
      return;
    }
    router.back();
  };

  const canComplete = session && displayWatchedSeconds >= session.requiredSeconds;
  const packageCanOpen = rewardPackage?.status === 'unopened';
  const packageOpened = rewardPackage?.status === 'opened';

  return (
    <View style={styles.root}>
      <Image source={backgroundSource} style={StyleSheet.absoluteFill} contentFit="cover" />

      <View style={styles.screenHeader}>
        <Pressable onPress={goMatchHub} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={CURVAO_DESIGN.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.topBarTitle}>LIVE WATCH</Text>
          <Text style={styles.headerSubtitle}>Earned. Not Bought.</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RewardPreview template={rewardTemplate} />

        {loading ? (
          <StatusPanel text="Live Watch wird geladen..." />
        ) : error ? (
          <View style={styles.panel}>
            <Text style={styles.errorText}>{error}</Text>
            <PrimaryButton label="ERNEUT VERSUCHEN" onPress={fetchSession} variant="secondary" />
          </View>
        ) : packageCanOpen || packageOpened ? (
          <View style={styles.panel}>
            <View style={styles.packageIcon}>
              <Ionicons name={packageOpened ? 'checkmark-circle-outline' : 'cube-outline'} size={34} color={packageOpened ? CURVAO_DESIGN.mint : CURVAO_DESIGN.gold} />
            </View>
            <Text style={styles.statusText}>{packageOpened ? 'Reward erhalten' : 'Reward wartet'}</Text>
            <Text style={styles.instruction}>
              {packageOpened ? 'Live Watch abgeschlossen. Earned. Not Bought.' : 'Dein Live Watch Reward Package ist bereit.'}
            </Text>
            <PrimaryButton
              label={packageOpened ? 'ZUR SAMMLUNG' : 'REWARD ÖFFNEN'}
              onPress={() => {
                if (packageOpened) {
                  router.push('/collection?section=Sammlung');
                  return;
                }
                if (rewardPackage) {
                  router.push({ pathname: '/reward-package/[id]', params: { id: rewardPackage.id } });
                }
              }}
              variant={packageOpened ? 'secondary' : 'primary'}
            />
            <Pressable disabled={checkingIn} onPress={handleStadiumCheckIn} style={[styles.secondaryButtonWide, checkingIn && styles.secondaryButtonDisabled]}>
              <Ionicons name="location-outline" size={18} color={CURVAO_DESIGN.gold} />
              <Text style={styles.secondaryButtonText}>{checkingIn ? 'CHECK-IN...' : 'STADIUM CHECK-IN'}</Text>
            </Pressable>
          </View>
        ) : session ? (
          <View style={styles.panel}>
            {canComplete ? (
              <View style={styles.packageIcon}>
                <Ionicons name="cube-outline" size={34} color={CURVAO_DESIGN.gold} />
              </View>
            ) : (
              <View style={styles.timerCircle}>
                <Text style={styles.timerTime}>{formatWatchDuration(displayWatchedSeconds)}</Text>
                <Text style={styles.timerTotal}>/ {formatWatchDuration(session.requiredSeconds)}</Text>
              </View>
            )}

            {!canComplete ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (displayWatchedSeconds / Math.max(1, session.requiredSeconds)) * 100)}%` }]} />
              </View>
            ) : null}

            <Text style={styles.statusText}>{canComplete ? 'Reward Package bereit' : 'Live Watch läuft'}</Text>
            <Text style={styles.instruction}>{canComplete ? 'Du hast dir dieses Package durch Live Watch verdient.' : 'Watch Time wird automatisch gespeichert.'}</Text>
            {checkinMessage ? <Text style={styles.checkinMessage}>{checkinMessage}</Text> : null}

            <PrimaryButton
              label={canComplete ? 'REWARD ÖFFNEN' : 'REWARD WARTET'}
              onPress={handleComplete}
              disabled={!canComplete}
              variant={canComplete ? 'primary' : 'secondary'}
            />
            <View style={styles.secondaryActions}>
              <Pressable disabled={checkingIn} onPress={handleStadiumCheckIn} style={[styles.secondaryButton, checkingIn && styles.secondaryButtonDisabled]}>
                <Ionicons name="location-outline" size={18} color={CURVAO_DESIGN.gold} />
                <Text style={styles.secondaryButtonText}>{checkingIn ? 'CHECK-IN...' : 'STADIUM CHECK-IN'}</Text>
              </Pressable>
              <Pressable onPress={handleCancel} style={[styles.secondaryButton, styles.cancelButton]}>
                <Ionicons name="close-circle-outline" size={18} color={CURVAO_DESIGN.danger} />
                <Text style={[styles.secondaryButtonText, styles.cancelButtonText]}>ABBRECHEN</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.infoText}>Keine aktive Session gefunden.</Text>
            <PrimaryButton
              label={starting ? 'STARTE...' : 'LIVE WATCH STARTEN'}
              onPress={handleStart}
              disabled={starting}
              variant="primary"
            />
            {checkinMessage ? <Text style={styles.checkinMessage}>{checkinMessage}</Text> : null}
            <Pressable disabled={checkingIn} onPress={handleStadiumCheckIn} style={[styles.secondaryButtonWide, checkingIn && styles.secondaryButtonDisabled]}>
              <Ionicons name="location-outline" size={18} color={CURVAO_DESIGN.gold} />
              <Text style={styles.secondaryButtonText}>{checkingIn ? 'CHECK-IN...' : 'STADIUM CHECK-IN'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function RewardPreview({ template }: { template: CardTemplate | null }) {
  return (
    <View style={styles.rewardPanel}>
      <View style={styles.rewardIcon}>
        <Ionicons name="albums-outline" size={24} color={CURVAO_DESIGN.gold} />
      </View>
      <View style={styles.rewardCopy}>
        <Text style={styles.rewardLabel}>MÖGLICHER REWARD</Text>
        <Text numberOfLines={1} style={styles.rewardTitle}>{template?.name ?? 'MatchCard'}</Text>
        <Text style={styles.rewardMeta}>Live Verified · +100 XP</Text>
      </View>
    </View>
  );
}

function StatusPanel({ text }: { text: string }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function formatWatchDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: CURVAO_DESIGN.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerCopy: {
    alignItems: 'center',
  },
  headerSubtitle: {
    color: CURVAO_DESIGN.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 3,
  },
  scrollContent: {
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 112,
  },
  panel: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.82)',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 20,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  rewardPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.84)',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  rewardIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  rewardCopy: {
    flex: 1,
  },
  rewardLabel: {
    color: CURVAO_DESIGN.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  rewardTitle: {
    color: CURVAO_DESIGN.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  rewardMeta: {
    color: CURVAO_DESIGN.gold,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 30,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: CURVAO_DESIGN.surface,
    borderWidth: 4,
    borderColor: CURVAO_DESIGN.gold,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 0px 20px ${CURVAO_DESIGN.gold}80`,
    elevation: 10,
  },
  packageIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.24)',
    borderRadius: 42,
    borderWidth: 1,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  timerTime: {
    color: CURVAO_DESIGN.text,
    fontSize: 48,
    fontWeight: '800',
  },
  timerTotal: {
    color: CURVAO_DESIGN.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  progressTrack: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: CURVAO_DESIGN.gold,
    borderRadius: 4,
  },
  statusText: {
    color: CURVAO_DESIGN.mint,
    fontSize: 14,
    fontWeight: '700',
  },
  instruction: {
    color: CURVAO_DESIGN.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  checkinMessage: {
    color: CURVAO_DESIGN.gold,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 10,
  },
  secondaryButtonWide: {
    alignItems: 'center',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
    width: '100%',
  },
  secondaryButtonDisabled: {
    opacity: 0.58,
  },
  secondaryButtonText: {
    color: CURVAO_DESIGN.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cancelButton: {
    borderColor: 'rgba(184,87,77,0.28)',
  },
  cancelButtonText: {
    color: CURVAO_DESIGN.danger,
  },
  infoText: { color: CURVAO_DESIGN.muted, textAlign: 'center' },
  errorText: { color: CURVAO_DESIGN.danger, textAlign: 'center' },
});
