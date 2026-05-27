import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { getUserProgress, type UserProgress } from '@/src/services/progressService';
import { getCurrentUser } from '@/src/services/authService';

const CURVAO_DESIGN = {
  bg: '#080A09',
  surface: '#121614',
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  mint: '#22C878',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.22)',
};

export default function ProgressDetailScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        const data = await getUserProgress(user.id);
        setProgress(data);
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !progress) {
    return (
      <CurvaoScreen>
        <Pressable onPress={() => router.back()} style={styles.backButtonRow}>
          <Ionicons name="chevron-back" size={20} color={CURVAO_DESIGN.gold} />
          <Text style={styles.backButtonText}>ZURÜCK</Text>
        </Pressable>
        <Text style={styles.loadingText}>Laden...</Text>
      </CurvaoScreen>
    );
  }

  const {
    level,
    xp,
    nextLevelXp,
    cardsCount,
    cardsTarget,
    badgesCount,
    badgesTarget,
    streakDays,
    bestStreakDays,
    ranking,
    rankingPercentile,
    targetRankingPercentile
  } = progress;

  const safeNextLevelXp = Math.max(1, nextLevelXp);
  const rawPercent = xp / safeNextLevelXp;
  const progressPercent = Math.min(1, Math.max(0, rawPercent));
  const displayPercent = Math.round(progressPercent * 100);

  const formattedXp = xp.toLocaleString('de-DE');
  const formattedNextXp = nextLevelXp.toLocaleString('de-DE');
  const formattedRanking = ranking > 0 ? ranking.toLocaleString('de-DE') : '—';

  return (
    <CurvaoScreen padded={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButtonRow}>
          <Ionicons name="chevron-back" size={20} color={CURVAO_DESIGN.gold} />
          <Text style={styles.backButtonText}>ZURÜCK ZUM DASHBOARD</Text>
        </Pressable>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.shieldContainer}>
            <Ionicons name="shield" size={100} color={CURVAO_DESIGN.gold} style={styles.shieldBg} />
            <Text style={styles.shieldLevelText}>{level}</Text>
          </View>
          
          <Text style={styles.heroSubLabel}>SAMMLER-LEVEL</Text>
          <Text style={styles.heroLevel}>LEVEL {level}</Text>
          
          <View style={styles.heroProgressInfo}>
            <Text style={styles.heroPercent}>{displayPercent}% zur nächsten Stufe</Text>
            <Text style={styles.heroXp}>{formattedXp} / {formattedNextXp} XP</Text>
          </View>
          
          <View style={styles.heroTrack}>
            <View style={[styles.heroFill, { width: `${progressPercent * 100}%` }]} />
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsContainer}>
          {/* Cards */}
          <ProgressMetricCard 
            title="Gesammelte Cards" 
            value={cardsCount} 
            maxValue={cardsTarget} 
            icon="albums-sharp"
            onPress={() => router.push('/collection')}
          />

          {/* Badges */}
          <ProgressMetricCard 
            title="Freigeschaltete Badges" 
            value={badgesCount} 
            maxValue={badgesTarget} 
            icon="star-sharp" 
          />

          {/* Streak */}
          <StreakProgressCard 
            streakDays={streakDays} 
            bestStreakDays={bestStreakDays ?? streakDays} 
          />

          {/* Ranking */}
          <RankingProgressCard 
            ranking={formattedRanking} 
            percentile={rankingPercentile ?? 0} 
            targetPercentile={targetRankingPercentile ?? 10} 
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>EARNED. NOT BOUGHT.</Text>
        </View>
      </ScrollView>
    </CurvaoScreen>
  );
}

// Subcomponents

function ProgressMetricCard({ title, value, maxValue, icon, onPress }: any) {
  const progress = maxValue ? Math.min(1, Math.max(0, value / maxValue)) : 0;
  
  return (
    <Pressable style={styles.metricCard} onPress={onPress} disabled={!onPress}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconBox}>
          <Ionicons name={icon} size={18} color={CURVAO_DESIGN.gold} />
        </View>
        {onPress && <Ionicons name="chevron-forward" size={16} color={CURVAO_DESIGN.muted} />}
      </View>
      
      <Text style={styles.metricValue}>
        {value} {maxValue ? <Text style={styles.metricMax}>/ {maxValue}</Text> : null}
      </Text>
      
      <Text style={styles.metricTitle}>{title}</Text>
      
      {maxValue ? (
        <View style={styles.metricTrack}>
          <View style={[styles.metricFill, { width: `${progress * 100}%` }]} />
        </View>
      ) : null}
    </Pressable>
  );
}

function StreakProgressCard({ streakDays, bestStreakDays }: { streakDays: number, bestStreakDays: number }) {
  // Simple visual row of 5 flames to indicate streak
  const flames = Array(5).fill(0).map((_, i) => i < Math.min(5, streakDays) ? true : false);
  
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconBox}>
          <Ionicons name="flame-sharp" size={18} color={CURVAO_DESIGN.gold} />
        </View>
        <Text style={styles.metricBest}>Beste: {bestStreakDays} Tage</Text>
      </View>
      
      <Text style={styles.metricValue}>{streakDays} Tage</Text>
      <Text style={styles.metricTitle}>Tage Streak</Text>
      
      <View style={styles.streakVisual}>
        {flames.map((active, i) => (
          <Ionicons 
            key={i} 
            name={active ? "flame" : "flame-outline"} 
            size={18} 
            color={active ? CURVAO_DESIGN.gold : 'rgba(255,255,255,0.1)'} 
          />
        ))}
      </View>
      <Text style={styles.metricHint}>Bleib aktiv, um deine Serie zu halten.</Text>
    </View>
  );
}

function RankingProgressCard({ ranking, percentile, targetPercentile }: { ranking: string, percentile: number, targetPercentile: number }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconBox}>
          <Ionicons name="stats-chart-sharp" size={18} color={CURVAO_DESIGN.gold} />
        </View>
        <Text style={styles.metricBest}>Ziel: Top {targetPercentile}%</Text>
      </View>
      
      <Text style={styles.metricValue}>{ranking}</Text>
      <Text style={styles.metricTitle}>Ranking</Text>
      
      <View style={styles.rankingBarContainer}>
        <Text style={styles.rankingPercentText}>Top {percentile}%</Text>
        <View style={styles.metricTrack}>
          {/* Reverse visual: 100% means top 1%, 0% means bottom */}
          <View style={[styles.metricFill, { width: `${Math.max(0, 100 - percentile)}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    opacity: 0.8,
  },
  backButtonText: {
    color: CURVAO_DESIGN.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  loadingText: {
    color: CURVAO_DESIGN.muted,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: CURVAO_DESIGN.borderGold,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  shieldContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldBg: {
    position: 'absolute',
    opacity: 0.15,
  },
  shieldLevelText: {
    color: CURVAO_DESIGN.gold,
    fontSize: 32,
    fontWeight: '900',
  },
  heroSubLabel: {
    color: CURVAO_DESIGN.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroLevel: {
    color: CURVAO_DESIGN.text,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  heroProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 32,
    marginBottom: 8,
  },
  heroPercent: {
    color: CURVAO_DESIGN.text,
    fontSize: 12,
    fontWeight: '700',
  },
  heroXp: {
    color: CURVAO_DESIGN.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  heroFill: {
    height: '100%',
    backgroundColor: CURVAO_DESIGN.gold,
  },
  detailsContainer: {
    padding: 20,
    gap: 16,
  },
  metricCard: {
    backgroundColor: CURVAO_DESIGN.surface,
    borderWidth: 1,
    borderColor: CURVAO_DESIGN.borderGold,
    borderRadius: 20,
    padding: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(216,170,77,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.2)',
  },
  metricBest: {
    color: CURVAO_DESIGN.goldSoft,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: CURVAO_DESIGN.text,
    fontSize: 28,
    fontWeight: '900',
  },
  metricMax: {
    color: CURVAO_DESIGN.muted,
    fontSize: 16,
  },
  metricTitle: {
    color: CURVAO_DESIGN.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 20,
  },
  metricTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    backgroundColor: CURVAO_DESIGN.gold,
  },
  streakVisual: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  metricHint: {
    color: CURVAO_DESIGN.muted,
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.7,
  },
  rankingBarContainer: {
    marginTop: 0,
  },
  rankingPercentText: {
    color: CURVAO_DESIGN.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: CURVAO_DESIGN.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.4,
  },
});
