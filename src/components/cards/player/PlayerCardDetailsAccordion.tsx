import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  surface: '#121614',
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.18)',
};

type Row = {
  label: string;
  value: string;
};

export function PlayerCardDetailsAccordion({
  rows,
  children,
}: {
  rows: Row[];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setOpen((value) => !value)} style={[styles.header, open && styles.headerOpen]}>
        <View style={styles.headerLeft}>
          <Ionicons color={COLORS.gold} name="card-outline" size={18} />
          <Text style={styles.title}>KARTENDETAILS</Text>
        </View>
        <Ionicons color={COLORS.muted} name={open ? 'chevron-up' : 'chevron-down'} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.content}>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.row, index === rows.length - 1 && styles.lastRow]}>
              <Text style={styles.label}>{row.label}</Text>
              <Text numberOfLines={1} style={styles.value}>{row.value}</Text>
            </View>
          ))}
          {children ? <View style={styles.extraContent}>{children}</View> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    marginTop: 18,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderGold,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingHorizontal: 16,
  },
  headerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  content: {
    backgroundColor: COLORS.surfaceSoft,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderColor: COLORS.borderGold,
    borderTopWidth: 0,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  extraContent: {
    borderTopColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '54%',
    textAlign: 'right',
  },
});
