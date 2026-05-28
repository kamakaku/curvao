import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type FilterChip = {
  key: 'league' | 'matchday' | 'date' | 'team';
  label: string;
  active?: boolean;
};

type MatchFilterBarProps = {
  chips: FilterChip[];
  activeCount: number;
  onOpen: (key: FilterChip['key']) => void;
  onReset: () => void;
};

export function MatchFilterBar({ chips, activeCount, onOpen, onReset }: MatchFilterBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {chips.map((chip) => (
          <Pressable key={chip.key} onPress={() => onOpen(chip.key)} style={[styles.chip, chip.active && styles.chipActive]}>
            <Text numberOfLines={1} style={[styles.text, chip.active && styles.textActive]}>
              {chip.label}
            </Text>
            <Ionicons color={chip.active ? '#D8AA4D' : '#A7A39A'} name="chevron-down" size={14} />
          </Pressable>
        ))}
      </View>
      {activeCount > 0 ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{activeCount} Filter aktiv</Text>
          <Pressable onPress={onReset}>
            <Text style={styles.resetText}>Zurücksetzen</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,22,20,0.78)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 38,
    justifyContent: 'center',
    minWidth: 76,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: 'rgba(216,170,77,0.16)',
    borderColor: '#D8AA4D',
  },
  text: {
    color: '#F4F1E8',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 94,
  },
  textActive: {
    color: '#F4F1E8',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: '#A7A39A',
    fontSize: 12,
    fontWeight: '600',
  },
  resetText: {
    color: '#D8AA4D',
    fontSize: 12,
    fontWeight: '800',
  },
});
