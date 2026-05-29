import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  surface: '#121614',
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.18)',
};

type Moment = {
  date?: string;
  title: string;
  description: string;
};

export function PlayerHighlightMomentCompact({ moment }: { moment?: Moment }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HIGHLIGHT MOMENT</Text>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>ALLE ANSEHEN &gt;</Text>
        </Pressable>
      </View>

      {moment ? (
        <View style={styles.card}>
          <View style={styles.thumb}>
            <Ionicons color={COLORS.gold} name="sparkles-outline" size={22} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.date}>{moment.date || '—'}</Text>
            <Text numberOfLines={1} style={styles.momentTitle}>{moment.title}</Text>
            <Text numberOfLines={2} style={styles.description}>{moment.description}</Text>
          </View>
          <View style={styles.action}>
            <Ionicons color={COLORS.gold} name="play" size={18} />
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons color={COLORS.gold} name="sparkles-outline" size={18} />
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>Noch keine Highlight Moments</Text>
            <Text style={styles.emptyText}>Verdiene Momente über Live Watch und Stadium Check-ins.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  link: {
    minHeight: 24,
    justifyContent: 'center',
  },
  linkText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderGold,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 104,
    padding: 14,
  },
  thumb: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 8,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  date: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  momentTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  action: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.08)',
    borderColor: COLORS.borderGold,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderGold,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyIconCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emptyCopy: {
    flex: 1,
    gap: 4,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
