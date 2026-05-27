import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const STATS_COLORS = {
  surface: '#121614',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  border: 'rgba(216,170,77,0.16)',
};

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  sub: string;
};

function StatCard({ icon, value, label, sub }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={18} color={STATS_COLORS.gold} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statSub}>{sub}</Text>
      </View>
    </View>
  );
}

export function PlayerConnectionStats({ card }: { card: UserCard }) {
  // Derive some plausible values from card data
  // In a real app, these would come from the user's overall stats for this player/match
  const matchesSeen = card.stadiumVisitCount || 1;
  const bondLevel = card.bondLevel || 1;
  const momentsCount = 0; // Future expansion
  const cardsOwned = 1; // Derive from store in real usage

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DEINE VERBINDUNG</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LEVEL {bondLevel} FAN</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <StatCard 
          icon="eye-outline" 
          value={matchesSeen} 
          label="LIVE MATCHES" 
          sub="Erlebt & verifiziert" 
        />
        <StatCard 
          icon="medal-outline" 
          value={bondLevel} 
          label="BOND LEVEL" 
          sub="Von 5 Levels" 
        />
        <StatCard 
          icon="sparkles-outline" 
          value={momentsCount} 
          label="MOMENTE" 
          sub="Besondere Augenblicke" 
        />
        <StatCard 
          icon="albums-outline" 
          value={cardsOwned} 
          label="KARTEN" 
          sub="In deiner Sammlung" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: STATS_COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  levelBadge: {
    backgroundColor: 'rgba(216,170,77,0.1)',
    borderColor: 'rgba(216,170,77,0.2)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: {
    color: STATS_COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: STATS_COLORS.surface,
    borderColor: STATS_COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    width: '48%', // Rough 2x2 grid
    flexGrow: 1,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: 'rgba(216,170,77,0.2)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    gap: 2,
  },
  statValue: {
    color: STATS_COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: STATS_COLORS.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statSub: {
    color: STATS_COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
});
