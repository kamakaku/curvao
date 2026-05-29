import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  surface: '#121614',
  gold: '#D8AA4D',
  borderGold: 'rgba(216,170,77,0.22)',
};

type Chip = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

export function PlayerContextChips({ title, chips }: { title: string; chips: Chip[] }) {
  if (chips.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {chips.map((chip) => (
          <View key={chip.label} style={styles.chip}>
            <Ionicons color={COLORS.gold} name={chip.icon} size={14} />
            <Text style={styles.label}>{chip.label}</Text>
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
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderGold,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 42,
    paddingHorizontal: 14,
  },
  label: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
