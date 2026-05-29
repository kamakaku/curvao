import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { curvao } from '@/src/theme/curvaoTheme';

type CompactMatchActivityProps = {
  cardsCollected: number;
};

export function CompactMatchActivity({ cardsCollected }: CompactMatchActivityProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>DEINE AKTIVITÄT</Text>
        <Ionicons color={curvao.colors.muted} name="pulse-outline" size={18} />
      </View>
      <Text style={styles.text}>
        {cardsCollected > 0 ? `${cardsCollected} Matchday Card${cardsCollected === 1 ? '' : 's'} gesammelt.` : 'Noch keine Aktivität'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18,22,20,0.62)',
    borderColor: 'rgba(216,170,77,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 72,
    padding: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: curvao.colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  text: {
    color: curvao.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
});
