import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CardDetailPanel } from '@/src/components/CardDetailPanel';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { LiveWatchPrimaryCard } from '@/src/components/match/LiveWatchPrimaryCard';
import { MatchHero } from '@/src/components/match/MatchHero';
import { MatchInfoGrid } from '@/src/components/match/MatchInfoGrid';
import { MatchdaySetPreview } from '@/src/components/match/MatchdaySetPreview';
import { getCurrentUser } from '@/src/services/authService';
import { getMatchdaySetPreview, type MatchdaySetPreview as MatchdaySetPreviewData } from '@/src/services/cardSetService';
import { createCheckin, getUserCheckins } from '@/src/services/checkinService';
import { getMatchById } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CheckinType, Match, UserCard } from '@/src/types/models';
import { getMatchViewState } from '@/src/utils/matchUtils';

const FIXED_HERO_HEIGHT = 276;

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [match, setMatch] = useState<Match>();
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [selectedCard, setSelectedCard] = useState<UserCard>();
  const [matchdayPreview, setMatchdayPreview] = useState<MatchdaySetPreviewData | null>(null);
  const [stadiumCheckedIn, setStadiumCheckedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const [resolvedMatch, user] = await Promise.all([getMatchById(id), getCurrentUser()]);
        const checkins = await getUserCheckins(user.id);

        if (!mounted) return;

        if (!resolvedMatch) {
          setMatch(undefined);
          setUserId(user.id);
          setMatchdayPreview(null);
          setStadiumCheckedIn(false);
          return;
        }

        setMatch(resolvedMatch);
        setUserId(user.id);
        setStadiumCheckedIn(checkins.some((checkin) => checkin.match === id && checkin.type === 'stadium' && checkin.status === 'verified'));
        const preview = await getMatchdaySetPreview({ userId: user.id, matchId: resolvedMatch.id }).catch(() => null);
        if (mounted) setMatchdayPreview(preview);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function reloadUserState() {
    if (!id || !userId) return;
    const checkins = await getUserCheckins(userId);
    setStadiumCheckedIn(checkins.some((checkin) => checkin.match === id && checkin.type === 'stadium' && checkin.status === 'verified'));
    const preview = await getMatchdaySetPreview({ userId, matchId: id }).catch(() => null);
    setMatchdayPreview(preview);
  }

  async function handleCheckin(type: CheckinType) {
    if (!id || !userId) return;
    setWorking(true);
    try {
      const result = await createCheckin(userId, id, type);
      if (result.cards[0]) {
        setSelectedCard(result.cards[0]);
      }
      if (type === 'stadium') setStadiumCheckedIn(true);
      await reloadUserState();
    } catch (error) {
      Alert.alert('Check-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <CurvaoScreen padded={false}>
        <View style={styles.screen}>
          <EmptyState title="Matchday wird geladen..." />
        </View>
      </CurvaoScreen>
    );
  }

  if (!match) {
    return (
      <CurvaoScreen padded={false}>
        <View style={styles.screen}>
          <EmptyState title="Match not found" />
        </View>
      </CurvaoScreen>
    );
  }

  const viewState = getMatchViewState(match);
  const stadiumDisabled = stadiumCheckedIn || working || viewState.status === 'archived';
  const stadiumSubtitle = stadiumCheckedIn ? 'Vor Ort bestätigt' : 'Vor Ort verifizieren';
  const stadiumStatus = stadiumCheckedIn ? 'Check-in gespeichert' : viewState.status === 'archived' ? 'Nicht mehr verfügbar' : working ? 'Bitte warten...' : 'Check-in starten';
  const unopenedMatchdayRewardPackageId = matchdayPreview?.progress.unopenedRewardPackages?.[0]?.id;

  return (
    <CurvaoScreen
      contentTopInset={FIXED_HERO_HEIGHT}
      fixedTop={<MatchHero match={match} style={styles.fixedHero} />}
      padded={false}
    >
      <View style={styles.screen}>
        <View style={styles.sections}>
          {viewState.status !== 'final' ? (
            <View style={styles.actionRow}>
              <LiveWatchPrimaryCard
                blocked={stadiumCheckedIn}
                blockedReason="Im Stadion eingecheckt"
                matchId={match.id}
                onOpenLiveWatch={() => router.push({ pathname: '/live-watch/[matchId]', params: { matchId: match.id } })}
                onOpenRewardPackage={(packageId) => router.push({ pathname: '/reward-package/[id]', params: { id: packageId } })}
                userId={userId}
                variant="tile"
              />

              <Pressable
                disabled={stadiumDisabled}
                onPress={() => {
                  void handleCheckin('stadium');
                }}
                style={[styles.actionTile, styles.actionTileStadium, stadiumDisabled && styles.actionTileDisabled]}
              >
                <Text numberOfLines={1} style={styles.actionTitle}>
                  STADIUM CHECK-IN
                </Text>
                <Text numberOfLines={2} style={styles.actionSubtitle}>
                  {stadiumSubtitle}
                </Text>
                <View style={styles.actionDivider} />
                <View style={styles.actionStatusRow}>
                  <Ionicons
                    color={stadiumCheckedIn ? curvao.colors.gold : stadiumDisabled ? curvao.colors.muted : curvao.colors.gold}
                    name={stadiumCheckedIn ? 'checkmark-circle' : 'ellipse'}
                    size={10}
                  />
                  <Text numberOfLines={1} style={[styles.actionStatus, stadiumDisabled && !stadiumCheckedIn && styles.actionStatusDisabled]}>
                    {stadiumStatus}
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : null}

          <MatchdaySetPreview
            fallbackReason="Für dieses Match ist noch kein Matchday Set verfügbar."
            finalMatch={viewState.status === 'final'}
            onOpenRewardPackage={unopenedMatchdayRewardPackageId ? () => router.push({ pathname: '/reward-package/[id]', params: { id: unopenedMatchdayRewardPackageId } }) : undefined}
            onPress={matchdayPreview?.set.id ? () => router.push({ pathname: '/collection/set/[id]', params: { id: matchdayPreview.set.id } }) : undefined}
            preview={matchdayPreview}
          />

          <MatchInfoGrid match={match} />
        </View>
      </View>

      <CardDetailPanel card={selectedCard} onClose={() => setSelectedCard(undefined)} />
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 22,
    paddingBottom: 28,
  },
  fixedHero: {
    borderRadius: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 0,
    marginTop: 0,
  },
  sections: {
    gap: 18,
    paddingHorizontal: curvao.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionTile: {
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minHeight: 80,
    overflow: 'hidden',
    padding: 14,
  },
  actionTileStadium: {
    backgroundColor: 'rgba(32,24,14,0.94)',
    borderColor: 'rgba(216,170,77,0.24)',
  },
  actionTileDisabled: {
    opacity: 0.72,
  },
  actionTileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButtonTitle: {
    color: curvao.colors.gold,
    flex: 1,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginRight: 10,
  },
  actionButtonTitleDisabled: {
    color: curvao.colors.muted,
  },
  actionBadge: {
    color: curvao.colors.gold,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  actionTitle: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  actionSubtitle: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
    minHeight: 34,
  },
  actionDivider: {
    backgroundColor: 'rgba(216,170,77,0.12)',
    height: 1,
    marginTop: 'auto',
    marginBottom: 10,
  },
  actionStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionStatus: {
    color: curvao.colors.gold,
    flex: 1,
    fontSize: 8,
    fontWeight: '700',
  },
  actionStatusDisabled: {
    color: curvao.colors.muted,
  },
});
