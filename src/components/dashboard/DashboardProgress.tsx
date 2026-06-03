import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { curvao } from '@/src/theme/curvaoTheme';
import { getUserProgress, type UserProgress } from '@/src/services/progressService';
import { useAuth } from '@/src/providers/AuthProvider';

export function DashboardProgress() {
  const { user } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserProgress(user.id).then(setProgress).catch(console.warn);
  }, [user]);

  if (!progress) return null;

  return (
    <View style={styles.outerContainer}>
      <Pressable onPress={() => router.push('/progress')} style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
        <Text style={styles.title}>DEIN FORTSCHRITT</Text>
        <Ionicons name="chevron-forward" size={16} color={curvao.colors.gold} />
      </Pressable>

      <View style={styles.container}>
        <View style={styles.statsGrid}>
          <StatItem icon="albums-sharp" value={String(progress.cardsCount)} label="CARDS" />
          <StatItem icon="star-sharp" value={String(progress.badgesCount)} label="BADGES" />
          <StatItem icon="flame-sharp" value={String(progress.streakDays)} label="TAGE STREAK" />
          <StatItem icon="stats-chart-sharp" value={progress.ranking > 0 ? progress.ranking.toLocaleString('de-DE') : '—'} label="RANKING" />
        </View>
      </View>
    </View>
  );
}

function StatItem({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={26} color={curvao.colors.gold} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    gap: curvao.spacing.md,
  },
  container: {
    backgroundColor: 'rgba(12, 13, 14, 0.50)',
    borderRadius: 8,
    padding: curvao.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(118, 92, 54, 0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    color: curvao.colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  label: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
