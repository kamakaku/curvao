import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { StatPill } from '@/src/components/StatPill';
import { getAchievements, getFanStats, getUserAchievements } from '@/src/services/achievementService';
import { getCurrentUser } from '@/src/services/authService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { Achievement, FanStats, UserAchievement } from '@/src/types/models';

const emptyStats: FanStats = {
  verifiedMatches: 0,
  stadiumCheckins: 0,
  loggedViewings: 0,
  totalCards: 0,
  playerCards: 0,
  matchCards: 0,
  boundCards: 0,
  achievements: 0,
};

export default function PassScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<FanStats>(emptyStats);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const user = await getCurrentUser();
        const [nextStats, achievementList, unlockedList] = await Promise.all([
          getFanStats(user.id),
          getAchievements(),
          getUserAchievements(user.id),
        ]);
        setStats(nextStats);
        setAchievements(achievementList);
        setUnlocked(unlockedList);
      }

      load();
    }, []),
  );

  const unlockedIds = new Set(unlocked.map((item) => item.achievement));

  return (
    <CurvaoScreen>
      <Text style={styles.title}>Fan Pass</Text>
      <Text style={styles.copy}>A compact readout of verified support and archive growth.</Text>

      <View style={styles.stats}>
        <StatPill label="Verified Matches" value={stats.verifiedMatches} />
        <StatPill label="Stadium" value={stats.stadiumCheckins} />
        <StatPill label="Viewing" value={stats.loggedViewings} />
        <StatPill label="Total Cards" value={stats.totalCards} />
        <StatPill label="Player Cards" value={stats.playerCards} />
        <StatPill label="Match Cards" value={stats.matchCards} />
        <StatPill label="Bound Cards" value={stats.boundCards} />
        <StatPill label="Achievements" value={stats.achievements} />
      </View>

      <Pressable style={styles.sectionRow} onPress={() => router.push('/badges')}>
        <Text style={styles.section}>Achievements</Text>
        <Text style={styles.sectionLink}>ALLE BADGES</Text>
      </Pressable>
      {achievements.map((achievement) => (
        <View key={achievement.id} style={styles.achievement}>
          <Text style={styles.achievementName}>{achievement.name}</Text>
          <Text style={styles.achievementStatus}>{unlockedIds.has(achievement.id) ? 'Unlocked' : 'Locked'}</Text>
        </View>
      ))}
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: curvao.colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  copy: {
    color: curvao.colors.muted,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  section: {
    color: curvao.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionLink: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  achievement: {
    alignItems: 'center',
    backgroundColor: curvao.colors.surface,
    borderColor: curvao.colors.border,
    borderRadius: curvao.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  achievementName: {
    color: curvao.colors.text,
    fontWeight: '800',
  },
  achievementStatus: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
});
