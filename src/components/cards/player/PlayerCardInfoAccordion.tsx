import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCardOrigin, formatEdition } from '@/src/services/cardTemplateService';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const INFO_COLORS = {
  surface: '#121614',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  border: 'rgba(216,170,77,0.12)',
};

export function PlayerCardInfoAccordion({ card }: { card: UserCard }) {
  const [isOpen, setIsOpen] = useState(false);

  const infoRows = [
    { label: 'Herkunft', value: formatCardOrigin(card.origin) },
    { label: 'Erhalten am', value: new Date(card.acquiredAt).toLocaleDateString('de-DE') },
    { label: 'Edition', value: formatEdition(card) },
    { label: 'Status', value: card.bound ? 'Gebunden' : card.tradable ? 'Tauschbar' : 'Gesperrt' },
    { label: 'Card ID', value: card.id.substring(0, 12).toUpperCase() },
  ];

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={() => setIsOpen(!isOpen)} 
        style={[styles.header, isOpen && styles.headerOpen]}
      >
        <Text style={styles.title}>CARD INFO</Text>
        <Ionicons 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={INFO_COLORS.muted} 
        />
      </Pressable>

      {isOpen && (
        <View style={styles.content}>
          {infoRows.map((row, idx) => (
            <View key={row.label} style={[styles.row, idx === infoRows.length - 1 && styles.lastRow]}>
              <Text style={styles.label}>{row.label.toUpperCase()}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: INFO_COLORS.surface,
    borderColor: INFO_COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  headerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  title: {
    color: INFO_COLORS.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    backgroundColor: 'rgba(18,22,20,0.5)',
    borderColor: INFO_COLORS.border,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  label: {
    color: INFO_COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  value: {
    color: INFO_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
