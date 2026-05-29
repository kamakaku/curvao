import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getCardRelations } from '@/src/services/cardTemplateService';
import type { UserCard } from '@/src/types/models';

const BOX_COLORS = {
  surface: '#121614',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  border: 'rgba(216,170,77,0.16)',
};

type InfoBoxProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoBox({ icon, label, value }: InfoBoxProps) {
  return (
    <View style={styles.box}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={16} color={BOX_COLORS.gold} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      </View>
    </View>
  );
}

export function StadiumBiographyBoxes({ card }: { card: UserCard }) {
  const { stadium } = getCardRelations(card);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>STADION INFOS</Text>
      <View style={styles.grid}>
        <InfoBox 
          icon="business-outline" 
          label="STADT" 
          value={stadium?.city?.toUpperCase() || card.stadiumCity?.toUpperCase() || '—'} 
        />
        <InfoBox 
          icon="people-outline" 
          label="KAPAZITÄT" 
          value={stadium?.capacity ? `${(stadium.capacity/1000).toFixed(0)}K` : '—'} 
        />
        <InfoBox 
          icon="navigate-outline" 
          label="KOORDINATEN" 
          value={stadium?.latitude ? `${stadium.latitude.toFixed(2)}, ${stadium.longitude?.toFixed(2)}` : 'VERIFIED'} 
        />
        <InfoBox 
          icon="calendar-outline" 
          label="SAISON" 
          value={card.expand?.match?.season || '2025/2026'} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    color: BOX_COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  box: {
    backgroundColor: BOX_COLORS.surface,
    borderColor: BOX_COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: 'rgba(216,170,77,0.2)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: BOX_COLORS.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  value: {
    color: BOX_COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },
});
