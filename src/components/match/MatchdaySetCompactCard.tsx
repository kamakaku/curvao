import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type MatchdaySetCompactCardProps = {
  ownedCount: number;
  totalCount: number;
  onPress?: () => void;
};

export function MatchdaySetCompactCard({ ownedCount, totalCount, onPress }: MatchdaySetCompactCardProps) {
  const safeTotal = totalCount > 0 ? totalCount : 1;
  const percent = Math.min(100, Math.round((ownedCount / safeTotal) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Ionicons color={curvao.colors.gold} name="albums-outline" size={20} />
          <Text style={styles.title}>MATCHDAY SET</Text>
        </View>
        <Text style={styles.progressValue}>{ownedCount}/{totalCount || '—'}</Text>
      </View>

      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
      <Text style={styles.subText}>Fortschritt im Set</Text>

      <Pressable disabled={!onPress} onPress={onPress} style={[styles.button, !onPress && styles.buttonDisabled]}>
        <Text style={[styles.buttonText, !onPress && styles.buttonTextDisabled]}>SET ANSEHEN</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18,22,20,0.84)',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 130,
    maxHeight: 150,
    padding: 14,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  progressValue: {
    color: curvao.colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    height: 8,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: curvao.colors.gold,
    height: '100%',
  },
  subText: {
    color: curvao.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  button: {
    alignItems: 'center',
    borderColor: 'rgba(216,170,77,0.30)',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 44,
  },
  buttonDisabled: {
    borderColor: 'rgba(167,163,154,0.16)',
  },
  buttonText: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  buttonTextDisabled: {
    color: curvao.colors.muted,
  },
});
