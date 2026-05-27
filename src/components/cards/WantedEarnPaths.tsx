import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';
import type { EarnPath } from '@/src/services/wantedCardService';

function getPathIcon(type: EarnPath['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'live_watch':
      return 'eye-outline';
    case 'stadium_checkin':
      return 'location-outline';
    case 'set_reward':
      return 'albums-outline';
    case 'pack':
      return 'gift-outline';
    case 'matchday':
      return 'football-outline';
    default:
      return 'swap-horizontal-outline';
  }
}

export function WantedEarnPaths({ paths }: { paths: EarnPath[] }) {
  return (
    <View style={styles.wrap}>
      {paths.slice(0, 3).map((path) => (
        <View key={path.id} style={[styles.path, !path.available && styles.disabledPath]}>
          <Ionicons color={path.available ? curvao.colors.gold : curvao.colors.muted} name={getPathIcon(path.type)} size={12} />
          <Text numberOfLines={1} style={[styles.pathText, !path.available && styles.disabledText]}>{path.title}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  path: {
    alignItems: 'center',
    backgroundColor: 'rgba(216,170,77,0.10)',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disabledPath: {
    backgroundColor: 'rgba(167,163,154,0.07)',
    borderColor: 'rgba(167,163,154,0.14)',
  },
  pathText: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: curvao.typography.weight.black,
  },
  disabledText: {
    color: curvao.colors.muted,
  },
});
