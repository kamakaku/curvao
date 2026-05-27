import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextureOverlay } from '@/src/components/ui/TextureOverlay';
import { curvao } from '@/src/theme/curvaoTheme';

const CURVAO_DESIGN = {
  surface: '#121614',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.22)',
};

export type DashboardProgressCardProps = {
  level: number;
  xp: number;
  nextLevelXp: number;
  cardsCount: number;
  badgesCount: number;
  streakDays: number;
  ranking: number;
  onPress?: () => void;
};

export function DashboardProgressCard({
  level = 1,
  xp = 0,
  nextLevelXp = 100,
  cardsCount = 0,
  badgesCount = 0,
  streakDays = 0,
  ranking = 0,
  onPress
}: Partial<DashboardProgressCardProps>) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/progress');
    }
  };

  const safeNextLevelXp = Math.max(1, nextLevelXp); // prevent div by zero
  const rawPercent = xp / safeNextLevelXp;
  const progressPercent = Math.min(1, Math.max(0, rawPercent));
  const displayPercent = Math.round(progressPercent * 100);

  const formattedXp = xp.toLocaleString('de-DE');
  const formattedNextXp = nextLevelXp.toLocaleString('de-DE');
  const formattedRanking = ranking > 0 ? ranking.toLocaleString('de-DE') : '—';
  const formattedCards = cardsCount.toLocaleString('de-DE');
  const formattedBadges = badgesCount.toLocaleString('de-DE');
  const formattedStreak = streakDays.toLocaleString('de-DE');

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>DEIN FORTSCHRITT</Text>
      </View>

      <Pressable onPress={handlePress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <TextureOverlay opacity={0.06} />
        
        <View style={styles.mainRow}>
          <View style={styles.levelBlock}>
            <View style={styles.shield}>
              <Ionicons name="shield-checkmark" size={16} color={CURVAO_DESIGN.gold} />
            </View>
            <Text style={styles.levelText}>LEVEL {level}</Text>
          </View>
          <View style={styles.percentBlock}>
            <Text style={styles.percentText}>{displayPercent}%</Text>
            <Text style={styles.nextLevelText}>zur nächsten Stufe</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>{formattedXp} / {formattedNextXp} XP</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox value={formattedCards} label="CARDS" />
          <StatBox value={formattedBadges} label="BADGES" />
          <StatBox value={formattedStreak} label="TAGE STREAK" />
          <StatBox value={formattedRanking} label="RANKING" />
        </View>

        <View style={styles.chevronIcon}>
          <Ionicons name="chevron-forward" size={16} color={CURVAO_DESIGN.muted} />
        </View>
      </Pressable>
    </View>
  );
}

function StatBox({ value, label }: { value: string, label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    gap: curvao.spacing.md,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  title: {
    color: CURVAO_DESIGN.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: CURVAO_DESIGN.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CURVAO_DESIGN.borderGold,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
    elevation: 5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  levelBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shield: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(216,170,77,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.3)',
  },
  levelText: {
    color: CURVAO_DESIGN.gold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  percentBlock: {
    alignItems: 'flex-end',
    marginRight: 16, // Space for chevron
  },
  percentText: {
    color: CURVAO_DESIGN.text,
    fontSize: 14,
    fontWeight: '900',
  },
  nextLevelText: {
    color: CURVAO_DESIGN.muted,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: CURVAO_DESIGN.gold,
  },
  xpText: {
    color: CURVAO_DESIGN.muted,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statValue: {
    color: CURVAO_DESIGN.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    color: CURVAO_DESIGN.goldSoft,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chevronIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
