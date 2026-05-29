import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  surface: '#16181A',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: '#252528',
};

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  sub?: string;
  progress?: number;
};

export function PlayerConnectionCompact({
  items,
  onPress,
}: {
  items: Item[];
  onPress?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.item}>
            <View style={styles.itemTop}>
              <View style={styles.iconCircle}>
                <Ionicons color={COLORS.gold} name={item.icon} size={16} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>

            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.sub}>{item.sub ?? '—'}</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(0, Math.min(100, (item.progress ?? 0) * 100))}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderGold,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    minHeight: 136,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.85,
    shadowRadius: 9,
    elevation: 12,
    width: '48%',
  },
  itemTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: COLORS.borderGold,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  label: {
    color: COLORS.text,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  value: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
  },
  sub: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    minHeight: 28,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    height: 6,
    marginTop: 'auto',
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: COLORS.gold,
    borderRadius: 999,
    height: '100%',
  },
});
