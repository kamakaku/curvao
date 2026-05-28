import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

type QuickTabValue = 'all' | 'today' | 'tomorrow' | 'weekend' | 'live' | 'final';

type MatchQuickTabsProps = {
  value: QuickTabValue;
  onChange: (value: QuickTabValue) => void;
};

const TABS: { label: string; value: QuickTabValue }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Heute', value: 'today' },
  { label: 'Morgen', value: 'tomorrow' },
  { label: 'Wochenende', value: 'weekend' },
  { label: 'Live', value: 'live' },
  { label: 'Final', value: 'final' },
];

export function MatchQuickTabs({ value, onChange }: MatchQuickTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <Pressable key={tab.value} onPress={() => onChange(tab.value)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.text, active && styles.textActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.78)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    minWidth: 70,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: 'rgba(216,170,77,0.16)',
    borderColor: '#D8AA4D',
  },
  text: {
    color: '#A7A39A',
    fontSize: 12,
    fontWeight: '700',
  },
  textActive: {
    color: '#F4F1E8',
  },
});

export type { QuickTabValue };
