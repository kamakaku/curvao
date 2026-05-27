import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CardDetailPanel } from '@/src/components/CardDetailPanel';
import { CardTile } from '@/src/components/CardTile';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { WantedEarnPaths } from '@/src/components/cards/WantedEarnPaths';
import { getCurrentUser } from '@/src/services/authService';
import { getCardSetById, getUserSetProgress, type CardSetProgress } from '@/src/services/cardSetService';
import { claimSetCompletionReward, type SetCompletionResult } from '@/src/services/setCompletionService';
import {
  getEarnPathsForTarget,
  toggleWantedCard,
  type EarnPath,
  type WantedCardInput,
  type WantedCardTarget,
} from '@/src/services/wantedCardService';
import { getMatchById } from '@/src/services/matchService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CardSetSlot, Match, UserCard } from '@/src/types/models';
import type { ResolvedSetSlot } from '@/src/utils/setProgressUtils';

export default function CardSetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [progress, setProgress] = useState<CardSetProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<UserCard>();
  const [userId, setUserId] = useState<string>();
  const [pendingWantedSlotId, setPendingWantedSlotId] = useState<string>();
  const [match, setMatch] = useState<Match | null>(null);
  const [completionResult, setCompletionResult] = useState<SetCompletionResult | null>(null);
  const [earnPathsBySlot, setEarnPathsBySlot] = useState<Record<string, EarnPath[]>>({});

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      try {
        const user = await getCurrentUser();
        const [nextProgress, setRecord] = await Promise.all([
          getUserSetProgress({ userId: user.id, setId: id }),
          getCardSetById(id),
        ]);

        const nextMatchId = nextProgress?.set.matchId ?? setRecord?.matchId;
        const nextMatch = nextMatchId ? await getMatchById(nextMatchId).catch(() => null) : null;

        const pathEntries = nextProgress
          ? await Promise.all(
              nextProgress.slots.map(async (slot) => [
                slot.slot.id,
                await getEarnPathsForTarget(buildWantedTarget(user.id, nextProgress.set.id, nextProgress.set.clubId, nextProgress.set.season, slot.slot, nextMatch ?? undefined)).catch(() => []),
              ] as const),
            )
          : [];

        if (!mounted) return;
        setUserId(user.id);
        setProgress(nextProgress);
        setMatch(nextMatch ?? null);
        setEarnPathsBySlot(Object.fromEntries(pathEntries));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const groupedSlots = useMemo(() => {
    if (!progress) return [];
    const groups = [
      {
        key: 'match-stadium',
        title: 'MATCH & STADIUM',
        slots: progress.slots.filter((slot) => ['match_card', 'stadium_card', 'attendance_card'].includes(slot.slot.slotType)),
      },
      {
        key: 'players',
        title: 'PLAYER CARDS',
        slots: progress.slots.filter((slot) => ['player_card', 'mvp_card'].includes(slot.slot.slotType)),
      },
      {
        key: 'moments',
        title: 'MOMENT CARDS',
        slots: progress.slots.filter((slot) => ['moment_card'].includes(slot.slot.slotType)),
      },
      {
        key: 'rewards',
        title: 'REWARDS & BONUS',
        slots: progress.slots.filter((slot) => ['live_watch_reward', 'stadium_checkin_reward', 'completion_reward'].includes(slot.slot.slotType)),
      },
    ];

    return groups.filter((group) => group.slots.length > 0);
  }, [progress]);

  async function refresh() {
    if (!id || !userId) return;
    const nextProgress = await getUserSetProgress({ userId, setId: id });
    setProgress(nextProgress);
  }

  async function handleToggleWanted(slot: ResolvedSetSlot) {
    if (!progress || !userId) return;

    setPendingWantedSlotId(slot.slot.id);
    try {
      const input = wantedInputFromSlot(userId, progress.set.id, progress.set.clubId, progress.set.season, slot.slot, match ?? undefined);
      const result = await toggleWantedCard(input);
      void result;
      await refresh();
    } finally {
      setPendingWantedSlotId(undefined);
    }
  }

  async function handleClaimBonus() {
    if (!progress || !userId) return;
    const result = await claimSetCompletionReward({ userId, setId: progress.set.id });
    setCompletionResult(result);
    await refresh();
  }

  if (loading) {
    return <CurvaoScreen><Text style={styles.infoText}>Lädt Set...</Text></CurvaoScreen>;
  }

  if (!progress) {
    return <CurvaoScreen><EmptyState title="Set nicht gefunden." /></CurvaoScreen>;
  }

  const hasRewardPending = progress.slots.some((slot) => slot.status === 'reward_pending');
  const unopenedPackage = progress.unopenedRewardPackages?.find((rewardPackage) => rewardPackage.matchId === progress.set.matchId && rewardPackage.status === 'unopened');
  const ownedCards = progress.slots.filter((slot) => slot.userCard).map((slot) => slot.userCard!);
  const canAttemptClaim = progress.completed && Boolean(progress.set.completionReward);
  const completionCopy = completionResult?.message ?? (canAttemptClaim ? 'Set komplett. Sichere dir deinen Matchday Bonus.' : 'Bonus bald verfügbar');

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={curvao.colors.text} />
        </Pressable>
        <View style={styles.topBarTitleContainer}>
          <Text style={styles.topBarSub}>{getSetTypeLabel(progress.set.type)}</Text>
          <Text numberOfLines={1} style={styles.topBarTitle}>{progress.set.title.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroName}>{progress.set.title}</Text>
          {match ? (
            <>
              <Text style={styles.heroMeta}>
                {new Date(match.kickoffAt).toLocaleDateString('de-DE')} · {match.stadiumName}
              </Text>
              <Text style={styles.heroStatus}>
                {match.status === 'finished' ? `FINAL · ${match.homeScore ?? 0}:${match.awayScore ?? 0}` : match.status === 'live' ? 'LIVE' : 'UPCOMING'}
              </Text>
            </>
          ) : (
            <>
              {progress.set.subtitle ? <Text style={styles.heroMeta}>{progress.set.subtitle}</Text> : null}
              <Text style={styles.heroStatus}>{progress.set.status?.toUpperCase() || 'ACTIVE'}</Text>
            </>
          )}
          <Text style={styles.heroIntro}>
            {progress.set.type === 'matchday'
              ? 'Dieses Set sammelt alle digitalen Erinnerungen dieses Spiels.'
              : progress.set.description || 'Dieses Set zeigt den aktuellen Sammelstand der zugehörigen Cards.'}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>FORTSCHRITT</Text>
              <Text style={styles.progressValue}>{progress.ownedSlots} / {progress.totalSlots}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress.percent * 100}%` }]} />
            </View>
            <Text style={styles.percentText}>{Math.round(progress.percent * 100)}% VOLLSTÄNDIG</Text>
          </View>
        </View>

        {hasRewardPending && unopenedPackage ? (
          <Pressable onPress={() => router.push({ pathname: '/reward-package/[id]', params: { id: unopenedPackage.id } })} style={styles.noticeBox}>
            <Ionicons color={curvao.colors.gold} name="gift-outline" size={20} />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>REWARD PACKAGE</Text>
              <Text style={styles.noticeText}>Ein Reward Package wartet auf dich.</Text>
            </View>
            <Text style={styles.noticeCta}>REWARD ÖFFNEN</Text>
          </Pressable>
        ) : null}

        <View style={styles.rewardBox}>
          <View style={styles.rewardInfo}>
            <Ionicons name="trophy-outline" size={22} color={curvao.colors.gold} />
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardTitle}>SET BONUS</Text>
              <Text style={styles.rewardDesc}>{progress.set.completionReward?.xp ? `+${progress.set.completionReward.xp} XP · Matchday Badge` : 'Bonus bald verfügbar'}</Text>
              <Text style={styles.rewardHint}>{completionCopy}</Text>
            </View>
          </View>
          <Pressable disabled={!canAttemptClaim} onPress={() => void handleClaimBonus()} style={[styles.claimButton, !canAttemptClaim && styles.claimButtonDisabled]}>
            <Text style={[styles.claimButtonText, !canAttemptClaim && styles.claimButtonTextDisabled]}>SET BONUS SICHERN</Text>
          </Pressable>
        </View>

        {groupedSlots.map((group) => (
          <View key={group.key} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.grid}>
              {group.slots.map((slot) => (
                <View key={slot.slot.id} style={styles.slotWrapper}>
                  {slot.userCard ? (
                    <CardTile card={slot.userCard} onPress={() => setSelectedCard(slot.userCard)} fullWidth />
                  ) : (
                    <MissingSlotCard
                      earnPaths={earnPathsBySlot[slot.slot.id] ?? []}
                      onOpenMatch={progress.set.matchId ? () => router.push(`/matches/${progress.set.matchId}`) : undefined}
                      onOpenRewardPackage={slot.status === 'reward_pending' && unopenedPackage ? () => router.push({ pathname: '/reward-package/[id]', params: { id: unopenedPackage.id } }) : undefined}
                      onToggleWanted={() => void handleToggleWanted(slot)}
                      pendingWanted={pendingWantedSlotId === slot.slot.id}
                      slot={slot}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomActions}>
          {progress.set.matchId ? (
            <Pressable onPress={() => router.push(`/matches/${progress.set.matchId}`)} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>ZURÜCK ZUM MATCH</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <CardDetailPanel card={selectedCard} cards={ownedCards} onClose={() => setSelectedCard(undefined)} />
    </CurvaoScreen>
  );
}

function MissingSlotCard({
  slot,
  earnPaths,
  pendingWanted,
  onToggleWanted,
  onOpenRewardPackage,
  onOpenMatch,
}: {
  slot: ResolvedSetSlot;
  earnPaths: EarnPath[];
  pendingWanted?: boolean;
  onToggleWanted: () => void;
  onOpenRewardPackage?: () => void;
  onOpenMatch?: () => void;
}) {
  return (
    <View style={[styles.missingSlot, slot.status === 'wanted' && styles.missingSlotWanted, slot.status === 'locked' && styles.missingSlotLocked]}>
      <View style={styles.missingIcon}>
        <Ionicons name={getSlotIcon(slot)} size={28} color={getSlotColor(slot.status)} />
      </View>
      <Text numberOfLines={2} style={styles.missingLabel}>{slot.title}</Text>
      {slot.subtitle ? <Text numberOfLines={2} style={styles.missingSubtitle}>{slot.subtitle}</Text> : null}
      <Text style={styles.stateLabel}>{getStateCopy(slot.status)}</Text>
      <Text style={styles.missingHint}>{slot.hint}</Text>
      <WantedEarnPaths paths={earnPaths} />
      {slot.status === 'reward_pending' && onOpenRewardPackage ? (
        <Pressable onPress={onOpenRewardPackage} style={styles.inlineButton}>
          <Text style={styles.inlineButtonText}>REWARD ÖFFNEN</Text>
        </Pressable>
      ) : null}
      {slot.status === 'missing' || slot.status === 'wanted' ? (
        <Pressable disabled={pendingWanted} onPress={onToggleWanted} style={styles.inlineButton}>
          <Text style={styles.inlineButtonText}>{slot.status === 'wanted' ? 'GESUCHT' : 'GESUCHT MARKIEREN'}</Text>
        </Pressable>
      ) : null}
      {(slot.status === 'missing' || slot.status === 'locked') && onOpenMatch ? (
        <Pressable onPress={onOpenMatch} style={styles.inlineButtonSecondary}>
          <Text style={styles.inlineButtonSecondaryText}>SO VERDIENEN</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function wantedInputFromSlot(
  userId: string,
  setId: string,
  clubId: string | undefined,
  season: string | undefined,
  slot: CardSetSlot,
  match?: Match,
): WantedCardInput {
  const target = buildWantedTarget(userId, setId, clubId, season, slot, match);
  return {
    userId,
    targetType: target.targetType,
    cardTemplateId: target.cardTemplateId,
    playerId: target.playerId,
    matchId: target.matchId,
    stadiumId: target.stadiumId,
    setId: target.setId,
    clubId: target.clubId,
    season: target.season,
  };
}

function buildWantedTarget(
  userId: string,
  setId: string,
  clubId: string | undefined,
  season: string | undefined,
  slot: CardSetSlot,
  match?: Match,
): WantedCardTarget {
  void userId;
  if (slot.playerId) {
    return { targetType: 'player', cardTemplateId: slot.cardTemplateId, playerId: slot.playerId, setId, clubId, season, match };
  }
  if (slot.stadiumId) {
    return { targetType: 'stadium', cardTemplateId: slot.cardTemplateId, stadiumId: slot.stadiumId, setId, clubId, season, match };
  }
  return { targetType: 'match', cardTemplateId: slot.cardTemplateId, matchId: slot.matchId, setId, clubId, season, match };
}

function getSlotIcon(slot: ResolvedSetSlot): keyof typeof Ionicons.glyphMap {
  switch (slot.slot.slotType) {
    case 'match_card':
      return 'football-outline';
    case 'stadium_card':
    case 'attendance_card':
    case 'stadium_checkin_reward':
      return 'location-outline';
    case 'player_card':
    case 'mvp_card':
      return 'person-outline';
    case 'moment_card':
      return 'sparkles-outline';
    case 'live_watch_reward':
      return 'tv-outline';
    default:
      return 'gift-outline';
  }
}

function getSlotColor(status: ResolvedSetSlot['status']) {
  switch (status) {
    case 'owned':
      return '#22C878';
    case 'wanted':
    case 'reward_pending':
      return curvao.colors.gold;
    case 'locked':
      return curvao.colors.muted;
    default:
      return curvao.colors.text;
  }
}

function getStateCopy(status: ResolvedSetSlot['status']) {
  switch (status) {
    case 'owned':
      return 'BESITZT';
    case 'missing':
      return 'FEHLT';
    case 'wanted':
      return 'GESUCHT';
    case 'locked':
      return 'LOCKED';
    case 'reward_pending':
      return 'REWARD WARTET';
  }
}

function getSetTypeLabel(type: string) {
  switch (type) {
    case 'club_season':
      return 'CLUB SEASON';
    case 'stadium':
      return 'STADIUM SET';
    case 'moment':
      return 'MOMENT SET';
    case 'origin':
    case 'special':
      return 'SPECIAL SET';
    default:
      return 'MATCHDAY SET';
  }
}

const styles = StyleSheet.create({
  infoText: { color: curvao.colors.text, textAlign: 'center', marginTop: 100 },
  topBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  topBarTitleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  topBarSub: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  topBarTitle: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomColor: 'rgba(216,170,77,0.1)',
    borderBottomWidth: 1,
    padding: 24,
  },
  heroName: {
    color: curvao.colors.gold,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  heroMeta: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  heroStatus: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 8,
  },
  heroIntro: {
    color: curvao.colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 24,
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressValue: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  track: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: curvao.colors.gold,
    height: '100%',
  },
  percentText: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8,
    textAlign: 'center',
  },
  noticeBox: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeTitle: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  noticeText: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  noticeCta: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
  },
  rewardBox: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    padding: 16,
  },
  rewardInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  rewardCopy: {
    flexShrink: 1,
  },
  rewardTitle: {
    color: curvao.colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rewardDesc: {
    color: curvao.colors.text,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  rewardHint: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  claimButton: {
    backgroundColor: curvao.colors.gold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  claimButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  claimButtonText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  claimButtonTextDisabled: {
    color: curvao.colors.muted,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  slotWrapper: {
    aspectRatio: 0.72,
    width: '47%',
  },
  missingSlot: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    padding: 12,
  },
  missingSlotWanted: {
    borderColor: 'rgba(216,170,77,0.28)',
  },
  missingSlotLocked: {
    borderColor: 'rgba(167,163,154,0.18)',
  },
  missingIcon: {
    marginBottom: 2,
  },
  missingLabel: {
    color: curvao.colors.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  missingSubtitle: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateLabel: {
    color: curvao.colors.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  missingHint: {
    color: curvao.colors.muted,
    fontSize: 9,
    lineHeight: 13,
    opacity: 0.9,
    textAlign: 'center',
  },
  inlineButton: {
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inlineButtonText: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
  },
  inlineButtonSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inlineButtonSecondaryText: {
    color: curvao.colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  bottomActions: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: 'rgba(216,170,77,0.22)',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
});
