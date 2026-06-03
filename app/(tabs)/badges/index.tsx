import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { getCurrentUser } from '@/src/services/authService';
import { getAchievements, getFanStats, getUserAchievements } from '@/src/services/achievementService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Achievement, FanStats, UserAchievement } from '@/src/types/models';

type BadgeTabKey = 'unlocked' | 'in_progress' | 'locked';

type BadgeListItem = Achievement & {
  unlockedAt?: string;
  progressValue: number;
  progressTarget: number;
  status: BadgeTabKey;
};

const TAB_LABELS: Record<BadgeTabKey, string> = {
  unlocked: 'Errungen',
  in_progress: 'In Arbeit',
  locked: 'Gesperrt',
};

export default function BadgesScreen() {
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BadgeTabKey>('unlocked');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        try {
          const user = await getCurrentUser();
          const [allAchievements, unlockedAchievements, fanStats] = await Promise.all([
            getAchievements(),
            getUserAchievements(user.id),
            getFanStats(user.id),
          ]);

          const unlockedMap = new Map<string, UserAchievement>(
            unlockedAchievements.map((entry) => [entry.achievement, entry]),
          );

          const nextBadges = allAchievements
            .map<BadgeListItem>((achievement) => {
              const progress = getAchievementProgress(achievement, fanStats);
              const unlocked = unlockedMap.get(achievement.id);
              return {
                ...achievement,
                unlockedAt: unlocked?.unlockedAt,
                progressValue: progress.current,
                progressTarget: progress.target,
                status: unlocked ? 'unlocked' : progress.current > 0 ? 'in_progress' : 'locked',
              };
            })
            .sort((left, right) => {
              if (left.status !== right.status) {
                const order: Record<BadgeTabKey, number> = { unlocked: 0, in_progress: 1, locked: 2 };
                return order[left.status] - order[right.status];
              }
              const leftTime = left.unlockedAt ? new Date(left.unlockedAt).getTime() : 0;
              const rightTime = right.unlockedAt ? new Date(right.unlockedAt).getTime() : 0;
              if (left.status === 'unlocked' && right.status === 'unlocked') {
                return rightTime - leftTime;
              }
              return right.progressValue / Math.max(1, right.progressTarget) - left.progressValue / Math.max(1, left.progressTarget);
            });

          if (active) {
            setBadges(nextBadges);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      setLoading(true);
      load();

      return () => {
        active = false;
      };
    }, []),
  );

  const groupedBadges = {
    unlocked: badges.filter((badge) => badge.status === 'unlocked'),
    in_progress: badges.filter((badge) => badge.status === 'in_progress'),
    locked: badges.filter((badge) => badge.status === 'locked'),
  };

  const visibleBadges = groupedBadges[activeTab];

  return (
    <CurvaoScreen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={curvao.colors.gold} />
            <Text style={styles.backText}>ZURÜCK</Text>
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>FAN PASS</Text>
          <Text style={styles.title}>Deine Badges</Text>
          <Text style={styles.copy}>Hier siehst du alle freigeschalteten, laufenden und gesperrten Achievements.</Text>
        </View>

        <View style={styles.tabsRow}>
          {(['unlocked', 'in_progress', 'locked'] as BadgeTabKey[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
            >
              <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
                {TAB_LABELS[tab]} ({groupedBadges[tab].length})
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? <Text style={styles.stateText}>Laden...</Text> : null}

        {!loading && visibleBadges.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={28} color={curvao.colors.gold} />
            <Text style={styles.emptyTitle}>{getEmptyTitle(activeTab)}</Text>
            <Text style={styles.emptyCopy}>{getEmptyCopy(activeTab)}</Text>
          </View>
        ) : null}

        {!loading
          ? visibleBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <View style={styles.badgeTopRow}>
                  <View style={[styles.badgeIcon, getBadgeIconTone(badge).containerStyle]}>
                    <Ionicons name={getBadgeIcon(badge)} size={18} color={getBadgeIconTone(badge).iconColor} />
                  </View>
                  <View style={styles.badgeBody}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    {badge.description ? <Text style={styles.badgeDescription}>{badge.description}</Text> : null}
                  </View>
                  <View style={[styles.statePill, badge.status === 'unlocked' && styles.statePillUnlocked]}>
                    <Text style={[styles.statePillText, badge.status === 'unlocked' && styles.statePillTextUnlocked]}>
                      {TAB_LABELS[badge.status]}
                    </Text>
                  </View>
                </View>

                {badge.status === 'unlocked' ? (
                  <Text style={styles.badgeMeta}>
                    Freigeschaltet{badge.unlockedAt ? ` · ${formatDate(badge.unlockedAt)}` : ''}
                  </Text>
                ) : (
                  <View style={styles.progressBlock}>
                    <View style={styles.progressTopRow}>
                      <Text style={styles.progressLabel}>Fortschritt</Text>
                      <Text style={styles.progressMeta}>
                        {badge.progressValue} / {badge.progressTarget}
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(100, Math.max(0, (badge.progressValue / Math.max(1, badge.progressTarget)) * 100))}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))
          : null}
      </ScrollView>
    </CurvaoScreen>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getAchievementProgress(achievement: Achievement, stats: FanStats) {
  const target = Math.max(achievement.threshold ?? 1, 1);

  switch (achievement.key) {
    case 'first_match':
    case 'three_match_cards':
      return { current: stats.matchCards, target };
    case 'first_stadium_checkin':
      return { current: stats.stadiumCheckins, target };
    case 'first_player_card':
      return { current: stats.playerCards, target };
    case 'first_bound_duplicate':
      return { current: stats.boundCards, target };
    default:
      switch (achievement.type) {
        case 'match_count':
          return { current: stats.matchCards, target };
        case 'stadium_count':
          return { current: stats.stadiumCheckins, target };
        case 'card_count':
          return { current: stats.totalCards, target };
        case 'bound_count':
          return { current: stats.boundCards, target };
        default:
          return { current: 0, target };
      }
  }
}

function getEmptyTitle(tab: BadgeTabKey) {
  if (tab === 'unlocked') return 'Noch keine Badges freigeschaltet.';
  if (tab === 'in_progress') return 'Aktuell keine Badges in Arbeit.';
  return 'Keine gesperrten Badges gefunden.';
}

function getEmptyCopy(tab: BadgeTabKey) {
  if (tab === 'unlocked') return 'Verdiene Cards, Check-ins und verifizierte Momente, um Achievements zu öffnen.';
  if (tab === 'in_progress') return 'Sobald bei einem Achievement echter Fortschritt vorhanden ist, taucht es hier auf.';
  return 'Aktuell gibt es für deinen Datenstand keine weiteren gesperrten Badges.';
}

function getBadgeIcon(badge: Pick<Achievement, 'key' | 'type'>) {
  switch (badge.key) {
    case 'first_match':
    case 'three_match_cards':
      return 'football-outline' as const;
    case 'first_stadium_checkin':
      return 'location-outline' as const;
    case 'first_player_card':
      return 'person-outline' as const;
    case 'first_bound_duplicate':
      return 'copy-outline' as const;
    default:
      switch (badge.type) {
        case 'match_count':
          return 'football-outline' as const;
        case 'stadium_count':
          return 'location-outline' as const;
        case 'card_count':
          return 'albums-outline' as const;
        case 'bound_count':
          return 'copy-outline' as const;
        default:
          return 'star-outline' as const;
      }
  }
}

function getBadgeIconTone(badge: Pick<Achievement, 'key' | 'type'>) {
  switch (badge.key) {
    case 'first_match':
    case 'three_match_cards':
      return {
        iconColor: '#22C878',
        containerStyle: styles.badgeIconMint,
      };
    case 'first_stadium_checkin':
      return {
        iconColor: '#5FB7FF',
        containerStyle: styles.badgeIconBlue,
      };
    case 'first_player_card':
      return {
        iconColor: '#D8AA4D',
        containerStyle: styles.badgeIconGold,
      };
    case 'first_bound_duplicate':
      return {
        iconColor: '#C78BFF',
        containerStyle: styles.badgeIconPurple,
      };
    default:
      switch (badge.type) {
        case 'match_count':
          return {
            iconColor: '#22C878',
            containerStyle: styles.badgeIconMint,
          };
        case 'stadium_count':
          return {
            iconColor: '#5FB7FF',
            containerStyle: styles.badgeIconBlue,
          };
        case 'card_count':
          return {
            iconColor: '#D8AA4D',
            containerStyle: styles.badgeIconGold,
          };
        case 'bound_count':
          return {
            iconColor: '#C78BFF',
            containerStyle: styles.badgeIconPurple,
          };
        default:
          return {
            iconColor: curvao.colors.gold,
            containerStyle: styles.badgeIconGold,
          };
      }
  }
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  backText: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  copy: {
    color: curvao.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  stateText: {
    color: curvao.colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  tabsRow: {
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabChip: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    paddingBottom: 10,
    paddingTop: 2,
  },
  tabChipActive: {
    borderBottomColor: curvao.colors.gold,
  },
  tabChipText: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    fontWeight: curvao.typography.weight.black,
  },
  tabChipTextActive: {
    color: curvao.colors.text,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: curvao.colors.surface,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.lg,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  emptyTitle: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyCopy: {
    color: curvao.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  badgeCard: {
    backgroundColor: 'rgba(18,22,20,0.92)',
    borderColor: 'rgba(216,170,77,0.20)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  badgeTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  badgeIcon: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  badgeIconGold: {
    backgroundColor: 'rgba(216,170,77,0.12)',
    borderColor: 'rgba(216,170,77,0.24)',
  },
  badgeIconMint: {
    backgroundColor: 'rgba(34,200,120,0.12)',
    borderColor: 'rgba(34,200,120,0.24)',
  },
  badgeIconBlue: {
    backgroundColor: 'rgba(95,183,255,0.12)',
    borderColor: 'rgba(95,183,255,0.24)',
  },
  badgeIconPurple: {
    backgroundColor: 'rgba(199,139,255,0.12)',
    borderColor: 'rgba(199,139,255,0.24)',
  },
  badgeBody: {
    flex: 1,
    gap: 4,
  },
  badgeName: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.lg,
    fontWeight: curvao.typography.weight.black,
  },
  badgeDescription: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.sm,
    lineHeight: 18,
  },
  badgeMeta: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  statePill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statePillUnlocked: {
    backgroundColor: 'rgba(216,170,77,0.12)',
    borderColor: 'rgba(216,170,77,0.24)',
  },
  statePillText: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statePillTextUnlocked: {
    color: curvao.colors.gold,
  },
  progressBlock: {
    gap: 6,
  },
  progressTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: curvao.colors.gold,
    height: '100%',
  },
  progressLabel: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.bold,
    textTransform: 'uppercase',
  },
  progressMeta: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.xs,
    fontWeight: curvao.typography.weight.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
