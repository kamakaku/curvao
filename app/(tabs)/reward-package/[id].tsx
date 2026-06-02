import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RewardRevealCard } from '@/src/components/rewards/RewardRevealCard';
import { getCurrentUser } from '@/src/services/authService';
import {
  getRewardPackage,
  openRewardPackage,
  type PackageReward,
  type RewardPackage,
} from '@/src/services/rewardPackageService';
import { curvao } from '@/src/theme/curvaoTheme';

type OpeningState = 'loading' | 'ready' | 'opening' | 'revealing' | 'result' | 'opened' | 'error';

export default function RewardPackageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [rewardPackage, setRewardPackage] = useState<RewardPackage | null>(null);
  const [rewards, setRewards] = useState<PackageReward[]>([]);
  const [state, setState] = useState<OpeningState>('loading');
  const [revealedCount, setRevealedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const packScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      try {
        const user = await getCurrentUser();
        const nextPackage = await getRewardPackage(id, user.id);
        if (!mounted) return;
        if (!nextPackage) {
          setState('error');
          setError('Reward Package wurde nicht gefunden.');
          return;
        }
        setRewardPackage(nextPackage);
        setRewards(Array.isArray(nextPackage.metadata?.rewards) ? nextPackage.metadata.rewards as PackageReward[] : []);
        setState(nextPackage.status === 'opened' ? 'opened' : 'ready');
      } catch {
        if (!mounted) return;
        setState('error');
        setError('Reward Package konnte nicht geladen werden.');
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const currentReward = rewards[revealedCount - 1];
  const isStadiumPackage = rewardPackage?.sourceType === 'stadium_checkin';

  async function openPackage() {
    if (!id || state === 'opening') return;
    setState('opening');
    setError(null);
    setRevealedCount(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(packScale, { toValue: 1.07, duration: 260, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(packScale, { toValue: 0.96, duration: 180, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.35, duration: 180, useNativeDriver: true }),
      ]),
      Animated.timing(packScale, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    try {
      const user = await getCurrentUser();
      const result = await openRewardPackage({ userId: user.id, packageId: id });
      setRewardPackage(result.package);
      setRewards(result.rewards);
      if (result.alreadyOpened) {
        setState('opened');
        return;
      }
      setRevealedCount(1);
      setState('revealing');
    } catch (openError) {
      setState('error');
      setError(openError instanceof Error ? openError.message : 'Reward Package konnte nicht geöffnet werden.');
    }
  }

  function revealNext() {
    if (revealedCount < rewards.length) {
      setRevealedCount((current) => current + 1);
      return;
    }
    setState('result');
  }

  function goMatch() {
    if (rewardPackage?.matchId) {
      router.replace(`/matches/${rewardPackage.matchId}`);
      return;
    }
    router.replace('/matches');
  }

  if (state === 'loading') {
    return <PackageShell title="Reward Package" subtitle="Wird geladen..." />;
  }

  if (state === 'error') {
    return (
      <PackageShell title="Reward Package" subtitle="Earned. Not Bought.">
        <View style={styles.panel}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton label="ZUM DASHBOARD" onPress={() => router.replace('/')} variant="secondary" />
        </View>
      </PackageShell>
    );
  }

  if (state === 'revealing') {
    return (
      <PackageShell title={`Reward ${revealedCount} / ${rewards.length}`} subtitle="Tippe weiter, um alle Rewards zu revealen.">
        <View style={styles.revealStage}>
          {currentReward ? <RewardRevealCard reward={currentReward} /> : null}
        </View>
        <PrimaryButton label={revealedCount < rewards.length ? 'NÄCHSTER REWARD' : 'ERGEBNIS ANZEIGEN'} onPress={revealNext} />
      </PackageShell>
    );
  }

  if (state === 'result' || state === 'opened') {
    const isStarter = rewardPackage?.sourceType === 'starter_pack';
    const isFanFive = rewardPackage?.sourceType === 'fan_five';

    return (
      <PackageShell 
        title="Deine Rewards" 
        subtitle={
            isStadiumPackage ? 'Stadium Check-in abgeschlossen. Earned. Not Bought.' : 
            isStarter ? 'Starter Pack geöffnet. Willkommen bei CURVAO!' :
            isFanFive ? 'Fan Five Performance Reward.' :
            'Live Watch abgeschlossen. Earned. Not Bought.'
        }
      >
        <View style={styles.resultList}>
          {rewards.map((reward) => (
            reward.userCard ? (
              <View key={reward.id} style={styles.resultCard}>
                <RewardRevealCard reward={reward} />
              </View>
            ) : (
              <View key={reward.id} style={styles.resultRow}>
                <Ionicons 
                    name={reward.type === 'card' ? 'albums-outline' : (reward.type === 'xp' || reward.type === 'connection_xp') ? 'flash-outline' : 'link-outline'} 
                    size={20} 
                    color={curvao.colors.gold} 
                />
                <View style={styles.resultCopy}>
                  <Text style={styles.resultTitle}>{reward.title}</Text>
                  {reward.subtitle ? <Text style={styles.resultSubtitle}>{reward.subtitle}</Text> : null}
                </View>
              </View>
            )
          ))}
        </View>
        <PrimaryButton label="ZUR SAMMLUNG" onPress={() => router.replace('/collection?section=Sammlung')} />
        <PrimaryButton label="ZUM DASHBOARD" onPress={() => router.replace('/')} variant="secondary" />
        
        {(() => {
          if (!__DEV__) return null;
          const debug = rewardPackage?.metadata?.selectionDebug as any;
          if (!debug) return null;
          return (
            <View style={{ marginTop: 20, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>DEV DEBUG (Reward Selection)</Text>
              <Text style={{ color: '#aaa', fontSize: 9 }}>Reason: {debug.selectionReason || '-'}</Text>
              <Text style={{ color: '#aaa', fontSize: 9 }}>Template: {debug.selectedTemplateId || '-'}</Text>
              <Text style={{ color: '#aaa', fontSize: 9 }}>Pool Size: {debug.matchPlayerPoolSize ?? '-'}</Text>
              {debug.fallbackUsed && (
                 <Text style={{ color: '#ff6b6b', fontSize: 9 }}>Fallback: {debug.fallbackReason || 'Unknown'}</Text>
              )}
            </View>
          );
        })()}
      </PackageShell>
    );
  }

  const getSourceLabel = () => {
    switch(rewardPackage?.sourceType) {
        case 'stadium_checkin': return 'Stadium Verified';
        case 'live_watch': return 'Live Verified';
        case 'starter_pack': return 'Starter Pack';
        case 'fan_five': return 'Performance Reward';
        case 'set_completion': return 'Set Bonus';
        default: return 'Earned Reward';
    }
  };

  return (
    <PackageShell 
        title={rewardPackage?.title ?? 'Reward Package'} 
        subtitle={
            isStadiumPackage ? 'Dein Stadium Reward wartet.' : 
            rewardPackage?.sourceType === 'starter_pack' ? 'Dein Starter Pack wartet.' :
            'Dein Matchday Reward wartet.'
        }
    >
      <Animated.View style={[styles.packageCard, { transform: [{ scale: packScale }] }]}>
        <Animated.View style={[styles.packageGlow, { opacity: glowOpacity }]} />
        <View style={styles.packageIcon}>
          <Ionicons name="cube-outline" size={42} color={curvao.colors.gold} />
        </View>
        <Text style={styles.packageTitle}>REWARD PACKAGE</Text>
        <Text style={styles.packageCopy}>
          {isStadiumPackage ? 'Du hast dir dieses Package durch deinen Stadium Check-in verdient.' : 
           rewardPackage?.sourceType === 'starter_pack' ? 'Deine ersten Cards für deine CURVAO Sammlung.' :
           'Du hast dir dieses Package durch Live Watch verdient.'}
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={getSourceLabel()} />
          <Badge label="Earned Reward" />
          <Badge label={`${rewardPackage?.rewardCount ?? rewards.length ?? 3} Rewards`} />
        </View>
      </Animated.View>
      <PrimaryButton label={state === 'opening' ? 'ÖFFNET…' : 'PACKAGE ÖFFNEN'} onPress={openPackage} disabled={state === 'opening'} />
    </PackageShell>
  );
}

function PackageShell({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [matchId, setMatchId] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;
    if (!id) return undefined;
    getCurrentUser()
      .then((user) => getRewardPackage(id, user.id))
      .then((rewardPackage) => {
        if (mounted) setMatchId(rewardPackage?.matchId);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [id]);

  function handleBack() {
    if (matchId) {
      router.replace(`/matches/${matchId}`);
      return;
    }
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.shell} showsVerticalScrollIndicator={false}>
      <Pressable onPress={handleBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
      </Pressable>
      <View style={styles.header}>
        <Text style={styles.kicker}>EARNED. NOT BOUGHT.</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 18,
    padding: 20,
    paddingBottom: 120,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 12,
  },
  kicker: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 2,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 28,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: 14,
    fontWeight: curvao.typography.weight.bold,
    textAlign: 'center',
  },
  packageCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(7,9,8,0.92)',
    borderColor: 'rgba(216,170,77,0.28)',
    borderRadius: 26,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
    padding: 28,
  },
  packageGlow: {
    backgroundColor: 'rgba(216,170,77,0.18)',
    borderRadius: 80,
    height: 240,
    position: 'absolute',
    top: 18,
    width: 240,
  },
  packageIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: 'rgba(216,170,77,0.25)',
    borderRadius: 46,
    borderWidth: 1,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  packageTitle: {
    color: curvao.colors.gold,
    fontSize: 25,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1.5,
  },
  packageCopy: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: curvao.typography.weight.bold,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: 'rgba(216,170,77,0.25)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: curvao.typography.weight.black,
    textTransform: 'uppercase',
  },
  revealStage: {
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  resultList: {
    alignItems: 'center',
    gap: 10,
  },
  resultCard: {
    alignItems: 'center',
    width: '100%',
  },
  resultRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.84)',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    padding: 14,
  },
  resultCopy: {
    flex: 1,
  },
  resultTitle: {
    color: curvao.colors.text,
    fontSize: 15,
    fontWeight: curvao.typography.weight.black,
  },
  resultSubtitle: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: curvao.typography.weight.bold,
  },
  panel: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.84)',
    borderColor: 'rgba(184,87,77,0.24)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  errorText: {
    color: curvao.colors.danger,
    fontSize: 14,
    fontWeight: curvao.typography.weight.bold,
    textAlign: 'center',
  },
});
