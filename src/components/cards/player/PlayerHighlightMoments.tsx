import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

const MOMENT_COLORS = {
  surface: '#121614',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
};

export function PlayerHighlightMoments() {
  // Currently we don't have real "Moment" data linked to players in the mock system
  // So we show the empty state as requested by the user
  const hasMoments = false;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HIGHLIGHT MOMENTS</Text>
        {hasMoments && (
          <Pressable>
            <Text style={styles.seeAll}>ALLE ANSEHEN ›</Text>
          </Pressable>
        )}
      </View>

      {!hasMoments ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={24} color={MOMENT_COLORS.muted} opacity={0.5} />
          <Text style={styles.emptyText}>Noch keine Highlight Moments.</Text>
          <Text style={styles.emptySub}>Verdiene Momente über Live Watch und Stadium Check-ins.</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Future expansion: Render actual moment cards */}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: MOMENT_COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  seeAll: {
    color: MOMENT_COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: MOMENT_COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    color: MOMENT_COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 20,
  },
});
