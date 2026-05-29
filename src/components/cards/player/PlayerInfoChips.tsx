import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.18)',
};

type Chip = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function PlayerInfoChips({ title, chips }: { title: string; chips: Chip[] }) {
  if (chips.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {chips.map((chip) => (
          <View key={`${chip.label}-${chip.value}`} style={styles.chip}>
            <Ionicons color={COLORS.gold} name={chip.icon} size={14} />
            <Text style={styles.chipLabel}>{chip.label}</Text>
            <Text numberOfLines={1} style={styles.chipValue}>{chip.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 20,
  },
  title: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  row: {
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderColor: COLORS.borderGold,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 42,
    paddingHorizontal: 14,
  },
  chipLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chipValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 140,
  },
});
